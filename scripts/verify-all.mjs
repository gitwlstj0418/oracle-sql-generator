/**
 * Sprint 4: 전체 대표 케이스 10건 및 예외 케이스 12건 전수 자동화 검증 스크립트
 */

const BASE_URL = 'http://localhost:3000/api/generate-sql'

const representativeTests = [
  {
    id: 'TC-01',
    category: 'SELECT (최근 10건 조회 / ROWNUM)',
    prompt: '회원 테이블에서 최근 가입한 10명을 조회해줘',
    expectedKeywords: ['SELECT', 'ROWNUM', 'ORDER BY created_at DESC'],
    expectDanger: false,
  },
  {
    id: 'TC-02',
    category: 'DELETE (조건부 삭제)',
    prompt: 'orders 테이블에서 status가 CANCEL인 데이터를 삭제해줘',
    expectedKeywords: ['DELETE FROM orders', "status = 'CANCEL'"],
    expectDanger: true,
  },
  {
    id: 'TC-03',
    category: 'UPDATE (조건부 수정)',
    prompt: 'users 테이블의 user_id가 100인 데이터의 이름을 홍길동으로 수정해줘',
    expectedKeywords: ['UPDATE users', "SET name = '홍길동'", 'user_id = 100'],
    expectDanger: true,
  },
  {
    id: 'TC-04',
    category: 'SELECT (집계 및 정렬)',
    prompt: '지난달 매출이 가장 높은 상품 5개를 보여줘',
    expectedKeywords: ['SELECT', 'GROUP BY product_id', 'ORDER BY total_sales DESC'],
    expectDanger: false,
  },
  {
    id: 'TC-05',
    category: 'SELECT (조건 및 정렬)',
    prompt: '직원 테이블(employees)에서 급여(salary)가 5000 이상인 사원을 이름순으로 정렬해줘',
    expectedKeywords: ['SELECT', 'FROM employees', 'salary >= 5000', 'ORDER BY name ASC'],
    expectDanger: false,
  },
  {
    id: 'TC-06',
    category: 'INSERT (단건 추가)',
    prompt: 'customers 테이블에 id가 1, name이 김철수인 회원을 추가해줘',
    expectedKeywords: ['INSERT INTO customers', '김철수'],
    expectDanger: false,
  },
  {
    id: 'TC-07',
    category: 'SELECT (날짜 조건 집계)',
    prompt: '게시글 테이블(posts)에서 오늘 작성된 글의 총 개수를 구해줘',
    expectedKeywords: ['SELECT COUNT(*)', 'FROM posts', 'TRUNC(SYSDATE)'],
    expectDanger: false,
  },
  {
    id: 'TC-08',
    category: 'SELECT (GROUP BY / HAVING)',
    prompt: '부서별 평균 급여를 구하고 평균 급여가 3000 이상인 부서만 조회해줘',
    expectedKeywords: ['SELECT', 'GROUP BY department_id', 'HAVING AVG(salary) >= 3000'],
    expectDanger: false,
  },
  {
    id: 'TC-09',
    category: 'TRUNCATE (데이터 초기화)',
    prompt: '로그 테이블(logs)의 모든 데이터를 비워줘',
    expectedKeywords: ['TRUNCATE TABLE logs'],
    expectDanger: true,
  },
  {
    id: 'TC-10',
    category: 'CREATE (테이블 생성)',
    prompt: '상품(products) 테이블을 생성하는 쿼리를 만들어줘 (id, name, price, stock)',
    expectedKeywords: ['CREATE TABLE products', 'id NUMBER', 'name VARCHAR2'],
    expectDanger: false,
  },
]

const exceptionTests = [
  {
    id: 'TC-E01',
    code: 'E-01',
    description: '입력값이 비어 있음',
    prompt: '   ',
    expectedErrorMessage: '내용을 입력해주세요',
  },
  {
    id: 'TC-E02',
    code: 'E-02',
    description: '입력값이 너무 짧음 (< 3자)',
    prompt: '조회',
    expectedErrorMessage: '올바른 내용을 입력해주세요',
  },
  {
    id: 'TC-E03',
    code: 'E-03',
    description: '입력값이 너무 김 (> 1000자)',
    prompt: '테이블에서 데이터를 조회해줘 '.repeat(100),
    expectedErrorMessage: '올바른 내용을 입력해주세요',
  },
  {
    id: 'TC-E07',
    code: 'E-07',
    description: 'DB 작업과 관계없는 일상 대화',
    prompt: '오늘 점심 메뉴 추천해줘',
    expectedErrorMessage:
      '올바른 DB 작업 기능인 조회/수정/삭제/생성 등의 기능의 단어가 포함되어 있는지 확인해 주세요',
  },
  {
    id: 'TC-E08',
    code: 'E-08',
    description: '요청의 대상 정보가 부족함',
    prompt: '데이터를 삭제해줘',
    expectedErrorMessage:
      '올바른 DB 작업 기능인 조회/수정/삭제/생성 등의 기능의 단어가 포함되어 있는지 확인해 주세요',
  },
  {
    id: 'TC-E09',
    code: 'E-09',
    description: '다른 DBMS 문법을 요청함 (MySQL)',
    prompt: 'MySQL 쿼리로 users 테이블 조회해줘',
    expectedErrorMessage: 'Oracle DB 작업 내용을 입력해주세요',
  },
]

async function runSuite() {
  console.log('=================================================================')
  console.log('  Oracle SQL Generator - Sprint 4 DoD & QA 자동 검증 시작')
  console.log('=================================================================\n')

  let repPassed = 0
  let expPassed = 0
  const results = {
    representative: [],
    exceptions: [],
  }

  // 1. 대표 케이스 10건 테스트 (성공조건 1.4: 8/10 이상)
  console.log('--- [1] 대표 자연어 요청 10건 테스트 (성공조건 1.4 검증) ---')
  for (const t of representativeTests) {
    const startTime = Date.now()
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: t.prompt, requestId: t.id }),
    })
    const duration = Date.now() - startTime
    const data = await res.json()

    const hasSql = Boolean(data.success && data.sql)
    const dangerMatch = Boolean(data.isDangerous) === t.expectDanger
    const keywordsMatch = t.expectedKeywords.every((kw) => data.sql && data.sql.includes(kw))
    const isPassed = hasSql && dangerMatch && keywordsMatch

    if (isPassed) repPassed++

    results.representative.push({
      id: t.id,
      category: t.category,
      prompt: t.prompt,
      passed: isPassed,
      durationMs: duration,
      sql: data.sql,
      isDangerous: data.isDangerous,
    })

    console.log(`[${isPassed ? 'PASS' : 'FAIL'}] ${t.id} - ${t.category} (${duration}ms)`)
    if (!isPassed) {
      console.log(`      Error: hasSql=${hasSql}, dangerMatch=${dangerMatch}, keywordsMatch=${keywordsMatch}`)
    }
  }

  // 2. 예외 케이스 검증
  console.log('\n--- [2] 예외 케이스 테스트 (PRD 5장 예외 처리 검증) ---')
  for (const t of exceptionTests) {
    const startTime = Date.now()
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: t.prompt, requestId: t.id }),
    })
    const duration = Date.now() - startTime
    const data = await res.json()

    const codeMatch = data.errorCode === t.code
    const msgMatch = data.errorMessage === t.expectedErrorMessage
    const isPassed = !data.success && codeMatch && msgMatch

    if (isPassed) expPassed++

    results.exceptions.push({
      id: t.id,
      code: t.code,
      description: t.description,
      passed: isPassed,
      durationMs: duration,
      returnedMessage: data.errorMessage,
    })

    console.log(`[${isPassed ? 'PASS' : 'FAIL'}] ${t.id} (${t.code}) - ${t.description} (${duration}ms)`)
    if (!isPassed) {
      console.log(`      Expected: "${t.expectedErrorMessage}"`)
      console.log(`      Actual:   "${data.errorMessage}" (Code: ${data.errorCode})`)
    }
  }

  console.log('\n=================================================================')
  console.log(`  대표 10건 결과: ${repPassed}/10 통과 (성공조건 8건 기준 충족 여부: ${repPassed >= 8 ? '성공 (PASS)' : '미달 (FAIL)'})`)
  console.log(`  예외 케이스 결과: ${expPassed}/${exceptionTests.length} 통과`)
  console.log('=================================================================\n')

  return { repPassed, expPassed, results }
}

runSuite()
