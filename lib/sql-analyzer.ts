import { DANGEROUS_SQL_KEYWORDS, NON_ORACLE_DBMS_KEYWORDS } from './constants'
import { DangerousKeyword, SqlAnalysisResult } from './types'

export function cleanSql(raw: string): string {
  if (!raw) return ''
  let cleaned = raw.trim()

  // 1. 마크다운 코드 블록 (```sql ... ``` or ``` ... ```)이 포함되어 있는 경우 내부 내용만 추출
  const codeBlockMatch = cleaned.match(/```(?:sql)?\s*([\s\S]*?)\s*```/i)
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim()
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:sql)?\s*\n?/i, '')
    cleaned = cleaned.replace(/\n?```\s*$/i, '')
  }

  // 2. 앞뒤 불필요한 따옴표 제거
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim()
  }

  return cleaned.trim()
}

/**
 * 생성된 SQL이 위험 SQL(데이터 수정/삭제/구조변경)인지 분석 (PRD 3.8 / 5.10)
 */
export function analyzeSqlSafety(sql: string): SqlAnalysisResult {
  const cleaned = cleanSql(sql)
  const upperSql = cleaned.toUpperCase()
  const matchedKeywords: DangerousKeyword[] = []

  for (const keyword of DANGEROUS_SQL_KEYWORDS) {
    // 단어 경계(\b)를 사용하여 부분 매칭 방지 (예: UPDATED_AT 컬럼명과 구분)
    const regex = new RegExp(`\\b${keyword}\\b`, 'i')
    if (regex.test(upperSql)) {
      matchedKeywords.push(keyword)
    }
  }

  // 대표적인 SQL 작업 타입 판별
  let sqlType = 'UNKNOWN'
  const firstWordMatch = upperSql.match(/^\s*([A-Z]+)/)
  if (firstWordMatch) {
    sqlType = firstWordMatch[1]
  }

  return {
    isDangerous: matchedKeywords.length > 0,
    dangerousKeywords: matchedKeywords,
    sqlType,
  }
}

/**
 * 타 DBMS(MySQL, PostgreSQL 등)를 명시적으로 요청했는지 판별 (PRD 5.9 / E-09)
 */
export function isNonOracleRequest(prompt: string): boolean {
  const lowerPrompt = prompt.toLowerCase()
  return NON_ORACLE_DBMS_KEYWORDS.some((kw) => {
    // 'oracle'이 함께 있더라도 'mysql로 변환' 등 다른 DBMS 요청인지 체크
    return lowerPrompt.includes(kw)
  })
}

/**
 * DB 작업과 관계없는 일상 대화 또는 질문인지 판별 (PRD 5.7 / E-07)
 */
export function isNonDbTask(prompt: string): boolean {
  const trimmed = prompt.trim()
  
  // DB 작업 관련 핵심 키워드 목록
  const dbActionKeywords = [
    '조회', '검색', '찾아', '가져와', '보여줘', '출력', '셀렉트', 'select',
    '추가', '생성', '삽입', '등록', '넣어', '인서트', 'insert', 'create',
    '수정', '변경', '업데이트', 'update',
    '삭제', '제거', '지워', '딜리트', 'delete', 'drop', 'truncate',
    '테이블', '컬럼', '열', '행', '데이터', 'table', 'column', 'schema',
    '조건', 'where', '정렬', 'order', 'group', 'join', '합계', '평균', '개수', 'count'
  ]

  const hasDbKeyword = dbActionKeywords.some(keyword => 
    trimmed.toLowerCase().includes(keyword)
  )

  return !hasDbKeyword
}

/**
 * 요청의 대상 정보가 지나치게 부족한지 판별 (PRD 5.8 / E-08)
 * 예: "데이터를 삭제해줘", "정보를 수정해줘", "최근 데이터를 조회해줘" (테이블명/조건 부재)
 */
export function isVagueRequest(prompt: string): boolean {
  const trimmed = prompt.trim().toLowerCase()
  const vaguePatterns = [
    /^데이터를?\s*(삭제|수정|조회|추가)해줘?$/i,
    /^정보를?\s*(삭제|수정|조회|추가)해줘?$/i,
    /^최근\s*데이터를?\s*(조회|검색)해줘?$/i,
    /^(삭제|수정|조회|추가)해줘?$/i,
  ]

  return vaguePatterns.some(pattern => pattern.test(trimmed))
}

/**
 * 문자열이 유효한 SQL 문인지 판별 (PRD 5.6 / E-06)
 */
export function isValidSql(text: string): boolean {
  const cleaned = cleanSql(text)
  if (!cleaned) return false

  const validSqlStarters = [
    'SELECT',
    'INSERT',
    'UPDATE',
    'DELETE',
    'CREATE',
    'DROP',
    'ALTER',
    'TRUNCATE',
    'MERGE',
    'WITH',
  ]

  const firstWord = cleaned.trim().split(/[\s(;]+/)[0]?.toUpperCase()
  return validSqlStarters.includes(firstWord)
}
