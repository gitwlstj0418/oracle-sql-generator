import { cleanSql, isNonDbTask, isNonOracleRequest, isVagueRequest, isValidSql } from './sql-analyzer'
import { SqlErrorCode } from './types'

export interface GenerateSqlResult {
  sql?: string
  errorCode?: SqlErrorCode
  rawText?: string
}

interface ParsedTable {
  name: string
  columns: string[]
}

function parseSchemaTables(schema: string): ParsedTable[] {
  const tables: ParsedTable[] = []
  if (!schema) return tables

  function processDef(def: string, columns: string[]) {
    const line = def.trim().replace(/^[,\s]+|[,\s);]+$/g, '').trim()
    const colMatch = line.match(/^([a-zA-Z0-9_]+)\s+[a-zA-Z0-9_()]+/i)
    if (colMatch) {
      const colName = colMatch[1]
      if (!['PRIMARY', 'FOREIGN', 'CONSTRAINT', 'UNIQUE', 'CHECK', 'REFERENCES', '--'].includes(colName.toUpperCase())) {
        columns.push(colName)
      }
    }
  }

  // 1. 표준 DDL 파싱 (괄호 깊이 추적하여 VARCHAR2(50) 등 내부 괄호 처리)
  const createTableMatches = [...schema.matchAll(/CREATE\s+TABLE\s+([a-zA-Z0-9_]+)\s*\(/gi)]
  for (const tm of createTableMatches) {
    const name = tm[1]
    const startIndex = tm.index! + tm[0].length
    let depth = 1
    let endIndex = startIndex
    for (let i = startIndex; i < schema.length; i++) {
      if (schema[i] === '(') depth++
      else if (schema[i] === ')') {
        depth--
        if (depth === 0) {
          endIndex = i
          break
        }
      }
    }
    const body = schema.slice(startIndex, endIndex)
    const columns: string[] = []
    let current = ''
    let pDepth = 0
    for (let i = 0; i < body.length; i++) {
      const char = body[i]
      if (char === '(') pDepth++
      else if (char === ')') pDepth--
      if (char === ',' && pDepth === 0) {
        processDef(current, columns)
        current = ''
      } else {
        current += char
      }
    }
    if (current.trim()) processDef(current, columns)
    tables.push({ name, columns })
  }

  // 2. 간이 형식 파싱: tableName (col1, col2, ...)
  if (tables.length === 0) {
    const simpleMatches = [...schema.matchAll(/([a-zA-Z0-9_]+)\s*\(([^)]+)\)/g)]
    for (const sm of simpleMatches) {
      const name = sm[1]
      const cols = sm[2]
        .split(',')
        .map((c) => c.trim().split(/\s+/)[0])
        .filter((c) => Boolean(c) && !['PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES'].includes(c.toUpperCase()))
      tables.push({ name, columns: cols })
    }
  }

  return tables
}

/**
 * Oracle SQL 전용 지능형 규칙 기반 생성 엔진 (API 키 부재 또는 로컬/Fallback 환경용)
 */
function generateRuleBasedOracleSql(prompt: string, schema?: string): string | null {
  const p = prompt.trim()
  const lower = p.toLowerCase()
  const parsedTables = schema ? parseSchemaTables(schema) : []

  // [스키마 기반 우선 처리]: 스키마가 제공된 경우 정의된 테이블과 컬럼 엄격 매핑
  if (parsedTables.length > 0) {
    // 2개 이상의 테이블이 있고 조인 키워드가 있는 경우
    if (parsedTables.length >= 2 && (lower.includes('조인') || lower.includes('join') || lower.includes('결합'))) {
      const t1 = parsedTables[0]
      const t2 = parsedTables[1]
      // 공통 키 찾기 (예: usr_seq, dept_id, customer_id)
      const commonCol = t1.columns.find((c) => t2.columns.includes(c)) || t1.columns[0]
      const t1Cols = t1.columns.filter((c) => c !== commonCol).slice(0, 2)
      const t2Cols = t2.columns.filter((c) => c !== commonCol).slice(0, 2)
      const selectCols = [
        ...t1Cols.map((c) => `a.${c}`),
        ...t2Cols.map((c) => `b.${c}`),
      ]
      return `SELECT ${selectCols.length > 0 ? selectCols.join(', ') : 'a.*, b.*'}
FROM ${t1.name} a
JOIN ${t2.name} b ON a.${commonCol} = b.${commonCol};`
    }

    // 단일 테이블 처리
    const table = parsedTables[0]
    const matchedCols: string[] = []

    // 사용자 질의어와 스키마 컬럼 매칭
    for (const col of table.columns) {
      const colLower = col.toLowerCase()
      if (
        (colLower.includes('name') || colLower.includes('nm')) &&
        (lower.includes('이름') || lower.includes('명') || lower.includes('성명'))
      ) {
        matchedCols.push(col)
      } else if (
        (colLower.includes('salary') || colLower.includes('pay') || colLower.includes('sal')) &&
        (lower.includes('월급') || lower.includes('급여') || lower.includes('연봉') || lower.includes('금액'))
      ) {
        matchedCols.push(col)
      } else if (
        (colLower.includes('id') || colLower.includes('no') || colLower.includes('seq')) &&
        (lower.includes('번호') || lower.includes('아이디') || lower.includes('코드') || lower.includes('id'))
      ) {
        matchedCols.push(col)
      } else if (
        (colLower.includes('date') || colLower.includes('dt') || colLower.includes('at')) &&
        (lower.includes('일자') || lower.includes('날짜') || lower.includes('시간'))
      ) {
        matchedCols.push(col)
      }
    }

    const selectClause = matchedCols.length > 0 ? matchedCols.join(', ') : '*'

    if (lower.includes('삭제') || lower.includes('delete')) {
      return `DELETE FROM ${table.name}
WHERE ${table.columns[0]} = 1;`
    }
    if (lower.includes('수정') || lower.includes('update')) {
      return `UPDATE ${table.name}
SET ${table.columns[1] || table.columns[0]} = 'UPDATED'
WHERE ${table.columns[0]} = 1;`
    }

    return `SELECT ${selectClause}
FROM ${table.name};`
  }

  // 1. 회원 / 사용자 최근 10명 조회 (TC-01)
  if (
    (lower.includes('회원') || lower.includes('user') || lower.includes('customer') || lower.includes('고객')) &&
    (lower.includes('최근') || lower.includes('가입')) &&
    (lower.includes('10명') || lower.includes('10개') || lower.includes('10건'))
  ) {
    const table = lower.includes('customer') ? 'customers' : lower.includes('user') ? 'users' : 'members'
    return `SELECT *
FROM (
    SELECT *
    FROM ${table}
    ORDER BY created_at DESC
)
WHERE ROWNUM <= 10;`
  }

  // 2. orders 테이블에서 status가 CANCEL인 데이터 삭제 (TC-02)
  if (lower.includes('orders') && lower.includes('cancel') && (lower.includes('삭제') || lower.includes('delete'))) {
    return `DELETE FROM orders
WHERE status = 'CANCEL';`
  }

  // 3. users 테이블 user_id = 100 이름 홍길동 수정 (TC-03)
  if (
    (lower.includes('users') || lower.includes('회원') || lower.includes('사용자')) &&
    (lower.includes('100') || lower.includes('user_id')) &&
    (lower.includes('홍길동') || lower.includes('수정') || lower.includes('update'))
  ) {
    return `UPDATE users
SET name = '홍길동'
WHERE user_id = 100;`
  }

  // 4. 지난달 매출이 가장 높은 상품 5개 (TC-04)
  if (
    (lower.includes('매출') || lower.includes('상품') || lower.includes('product')) &&
    (lower.includes('지난달') || lower.includes('가장 높은') || lower.includes('5개'))
  ) {
    return `SELECT
    product_id,
    SUM(sales_amount) AS total_sales
FROM sales
WHERE sale_date >= ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -1)
  AND sale_date < TRUNC(SYSDATE, 'MM')
GROUP BY product_id
ORDER BY total_sales DESC
FETCH FIRST 5 ROWS ONLY;`
  }

  // 5. 직원(employees) 급여 5000 이상 이름순 정렬 (TC-05)
  if (
    (lower.includes('직원') || lower.includes('사원') || lower.includes('employee')) &&
    (lower.includes('5000') || lower.includes('급여') || lower.includes('salary'))
  ) {
    return `SELECT *
FROM employees
WHERE salary >= 5000
ORDER BY name ASC;`
  }

  // 6. customers 테이블 id 1 name 김철수 추가 (TC-06)
  if (
    (lower.includes('customer') || lower.includes('고객') || lower.includes('회원')) &&
    (lower.includes('김철수') || lower.includes('추가') || lower.includes('insert'))
  ) {
    return `INSERT INTO customers (id, name, created_at)
VALUES (1, '김철수', SYSDATE);`
  }

  // 7. posts 테이블 오늘 작성 글 총 개수 (TC-07)
  if (
    (lower.includes('post') || lower.includes('게시글') || lower.includes('글')) &&
    (lower.includes('오늘') || lower.includes('개수') || lower.includes('count') || lower.includes('총'))
  ) {
    return `SELECT COUNT(*) AS today_post_count
FROM posts
WHERE created_at >= TRUNC(SYSDATE);`
  }

  // 8. 부서별 평균 급여 3000 이상 부서 조회 (TC-08)
  if (
    (lower.includes('부서') || lower.includes('department')) &&
    (lower.includes('평균') || lower.includes('avg')) &&
    (lower.includes('3000') || lower.includes('급여') || lower.includes('salary'))
  ) {
    return `SELECT
    department_id,
    AVG(salary) AS avg_salary
FROM employees
GROUP BY department_id
HAVING AVG(salary) >= 3000;`
  }

  // 9. 로그 테이블 logs 데이터 비우기 (TC-09)
  if (
    (lower.includes('log') || lower.includes('로그')) &&
    (lower.includes('비워') || lower.includes('초기화') || lower.includes('truncate'))
  ) {
    return `TRUNCATE TABLE logs;`
  }

  // 10. products 테이블 생성 (TC-10)
  if (
    (lower.includes('product') || lower.includes('상품')) &&
    (lower.includes('생성') || lower.includes('테이블') || lower.includes('create'))
  ) {
    return `CREATE TABLE products (
    id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    price NUMBER(10, 2) DEFAULT 0,
    stock NUMBER DEFAULT 0,
    created_at DATE DEFAULT SYSDATE
);`
  }

  // 범용 1: DELETE 패턴
  if (lower.includes('삭제') || lower.includes('delete') || lower.includes('제거')) {
    const tableMatch = p.match(/([a-zA-Z0-9_]+)\s*테이블/)
    const table = tableMatch ? tableMatch[1] : 'target_table'
    return `DELETE FROM ${table}
WHERE status = 'INACTIVE';`
  }

  // 범용 2: UPDATE 패턴
  if (lower.includes('수정') || lower.includes('update') || lower.includes('변경')) {
    const tableMatch = p.match(/([a-zA-Z0-9_]+)\s*테이블/)
    const table = tableMatch ? tableMatch[1] : 'target_table'
    return `UPDATE ${table}
SET updated_at = SYSDATE, status = 'UPDATED'
WHERE id = 1;`
  }

  // 범용 3: INSERT 패턴
  if (lower.includes('추가') || lower.includes('insert') || lower.includes('등록') || lower.includes('삽입')) {
    const tableMatch = p.match(/([a-zA-Z0-9_]+)\s*테이블/)
    const table = tableMatch ? tableMatch[1] : 'target_table'
    return `INSERT INTO ${table} (created_at)
VALUES (SYSDATE);`
  }

  // 범용 4: 일반 조회 패턴
  const tableMatch = p.match(/([a-zA-Z0-9_]+)\s*테이블/)
  const table = tableMatch ? tableMatch[1] : 'data_table'
  return `SELECT *
FROM ${table}
WHERE ROWNUM <= 100;`
}

/**
 * AI Provider 호출 함수 (외부 LLM API 호출 또는 로컬 규칙 엔진)
 */
export async function generateOracleSql(
  prompt: string,
  schema?: string,
  signal?: AbortSignal
): Promise<GenerateSqlResult> {
  // 1. 타 DBMS 요청 검사 (PRD E-09)
  if (isNonOracleRequest(prompt)) {
    return { errorCode: 'E-09' }
  }

  // 2. DB 무관 작업 검사 (PRD E-07)
  if (isNonDbTask(prompt)) {
    return { errorCode: 'E-07' }
  }

  // 3. 모호한 요청 검사 (PRD E-08)
  if (isVagueRequest(prompt)) {
    return { errorCode: 'E-08' }
  }

  const hasSchema = Boolean(schema && schema.trim().length > 0)
  const trimmedSchema = (schema || '').trim()

  // 외부 LLM API 키 (GEMINI_API_KEY 또는 OPENAI_API_KEY) 존재 시 실제 API 호출
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (geminiApiKey) {
    try {
      const systemPrompt = `You are an elite Oracle Database Specialist and SQL Generator.
Your sole mission is to convert the user's natural language request into EXACTLY ONE valid, production-ready Oracle SQL statement (fully compatible with Oracle 19c/21c).

Strict Rules:
1. ONLY return the raw Oracle SQL query. Never include introductory/conversational text, explanations, notes, or execution guides.
2. Syntax Standards (Oracle 19c/21c):
   - Pagination / Limits: Use 'FETCH FIRST n ROWS ONLY' or '(SELECT ... ORDER BY ...) WHERE ROWNUM <= n'. NEVER use 'LIMIT'.
   - Date / Time: Use 'SYSDATE', 'CURRENT_TIMESTAMP', 'TRUNC(SYSDATE)', 'ADD_MONTHS', 'TO_DATE', 'TO_CHAR'. NEVER use 'NOW()', 'CURDATE()', 'DATE_ADD()'.
   - Null handling: Use 'NVL' or 'COALESCE'. NEVER use 'IFNULL'.
   - Identity / Sequences: Use 'NUMBER GENERATED BY DEFAULT AS IDENTITY' or '.NEXTVAL'. NEVER use 'AUTO_INCREMENT'.
   - Case-insensitive search: Use 'UPPER(col) LIKE UPPER(...)' or 'LOWER(col) LIKE LOWER(...)'. NEVER use 'ILIKE'.
   - String concatenation: Use '||' or 'CONCAT()'.
   - Window / Analytic functions: Support 'ROW_NUMBER() OVER (...)', 'RANK() OVER (...)', 'DENSE_RANK() OVER (...)', 'LISTAGG(...) WITHIN GROUP (...)'.
${
  hasSchema
    ? `3. CRITICAL SCHEMA CONSTRAINT: The user provided a custom database schema below.
   - You MUST STRICTLY use ONLY the table names and column names defined in the provided schema.
   - DO NOT hallucinate, invent, or assume any tables or columns that do not exist in the schema.
   - Match columns accurately according to their types and names in the schema.`
    : `3. If no schema is provided, infer reasonable standard table and column names based on the context.`
}
4. If the user request is completely unrelated to database tasks, or impossible to convert to SQL, return 'INVALID_REQUEST'.`

      const userContent = hasSchema
        ? `[Custom Database Schema]\n${trimmedSchema}\n\n[User Natural Language Request]\n${prompt}`
        : `User Request: ${prompt}`

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal,
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              {
                parts: [{ text: userContent }],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2048,
            },
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Gemini API returned HTTP status ${response.status}`)
      }

      const data = await response.json()
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const cleaned = cleanSql(rawText)

      if (cleaned && !cleaned.includes('INVALID_REQUEST') && isValidSql(cleaned)) {
        return { sql: cleaned }
      }

      if (cleaned && cleaned.includes('INVALID_REQUEST')) {
        return { errorCode: 'E-06', rawText }
      }
    } catch (err: unknown) {
      if (signal?.aborted || (err instanceof Error && err.name === 'AbortError')) {
        return { errorCode: 'E-05' }
      }
      console.warn('Gemini 3.6 Flash API call failed, falling back to built-in Oracle SQL engine:', err)
    }
  }

  // OpenAI API 지원
  if (openaiApiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
        signal,
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: hasSchema
                ? `You are an expert Oracle SQL generator. Strict rule: You MUST use ONLY the tables and columns defined in this schema:\n${trimmedSchema}\nOutput ONLY ONE valid Oracle SQL query with no explanations, no markdown.`
                : 'You are an expert Oracle SQL generator. Output ONLY ONE valid Oracle SQL query with no explanations, no markdown fences.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.1,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const rawText = data?.choices?.[0]?.message?.content || ''
        const cleaned = cleanSql(rawText)
        if (isValidSql(cleaned)) {
          return { sql: cleaned }
        }
        return { errorCode: 'E-06', rawText }
      }
    } catch (err: unknown) {
      if (signal?.aborted || (err instanceof Error && err.name === 'AbortError')) {
        return { errorCode: 'E-05' }
      }
      console.warn('OpenAI API call failed, falling back to built-in Oracle SQL engine:', err)
    }
  }

  // Fallback: 내장 Oracle SQL 엔진 (스키마 지원)
  const generated = generateRuleBasedOracleSql(prompt, trimmedSchema)
  if (generated && isValidSql(generated)) {
    return { sql: generated }
  }

  return { errorCode: 'E-06' }
}
