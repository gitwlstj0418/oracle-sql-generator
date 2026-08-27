/**
 * Sprint 4, 5, 6: 대표 10건 + 심화 AI 쿼리 3건 + 스키마 제약 쿼리 2건 + 예외 케이스 6건 자동화 검증 스크립트
 */

const BASE_URL = 'http://localhost:3000/api/generate-sql'

const representativeTests = [
  {
    id: 'TC-01',
    category: 'SELECT (최근 10건 조회 / ROWNUM)',
    prompt: '회원 테이블에서 최근 가입한 10명을 조회해줘',
    expectDanger: false,
  },
  {
    id: 'TC-02',
    category: 'DELETE (조건부 삭제)',
    prompt: 'orders 테이블에서 status가 CANCEL인 데이터를 삭제해줘',
    expectDanger: true,
  },
  {
    id: 'TC-03',
    category: 'UPDATE (조건부 수정)',
    prompt: 'users 테이블의 user_id가 100인 데이터의 이름을 홍길동으로 수정해줘',
    expectDanger: true,
  },
  {
    id: 'TC-04',
    category: 'SELECT (집계 및 정렬)',
    prompt: '지난달 매출이 가장 높은 상품 5개를 보여줘',
    expectDanger: false,
  },
  {
    id: 'TC-05',
    category: 'SELECT (조건 및 정렬)',
    prompt: '직원 테이블(employees)에서 급여(salary)가 5000 이상인 사원을 이름순으로 정렬해줘',
    expectDanger: false,
  },
  {
    id: 'TC-06',
    category: 'INSERT (단건 추가)',
    prompt: 'customers 테이블에 id가 1, name이 김철수인 회원을 추가해줘',
    expectDanger: false,
  },
  {
    id: 'TC-07',
    category: 'SELECT (날짜 조건 집계)',
    prompt: '게시글 테이블(posts)에서 오늘 작성된 글의 총 개수를 구해줘',
    expectDanger: false,
  },
  {
    id: 'TC-08',
    category: 'SELECT (GROUP BY / HAVING)',
    prompt: '부서별 평균 급여를 구하고 평균 급여가 3000 이상인 부서만 조회해줘',
    expectDanger: false,
  },
  {
    id: 'TC-09',
    category: 'TRUNCATE (데이터 초기화)',
    prompt: '로그 테이블(logs)의 모든 데이터를 비워줘',
    expectDanger: true,
  },
  {
    id: 'TC-10',
    category: 'CREATE (테이블 생성)',
    prompt: '상품(products) 테이블을 생성하는 쿼리를 만들어줘 (id, name, price, stock)',
    expectDanger: false,
  },
]

const advancedAiTests = [
  {
    id: 'TC-AI01',
    category: '윈도우 분석 함수 / 부서별 1위 급여 조회',
    prompt: '부서별로 급여가 가장 높은 직원의 이름과 급여를 조회하는 쿼리를 작성해줘',
    expectDanger: false,
  },
  {
    id: 'TC-AI02',
    category: '날짜 연산 / 휴면 회원 조건부 삭제',
    prompt: '휴면 계정 테이블(dormant_users)에서 마지막 로그인일자가 1년 이상 지난 회원을 모두 삭제해줘',
    expectDanger: true,
  },
  {
    id: 'TC-AI03',
    category: '다중 JOIN / 주문 및 고객 정보 결합',
    prompt: '주문 테이블(orders)과 고객 테이블(customers)을 customer_id로 조인해서 주문금액이 10만원 이상인 고객명과 주문번호를 조회해줘',
    expectDanger: false,
  },
]

const schemaConstraintTests = [
  {
    id: 'TC-SCH01',
    category: '커스텀 스키마 컬럼 강제 (환각 방지)',
    schema: 'CREATE TABLE employees (emp_no NUMBER PRIMARY KEY, emp_nm VARCHAR2(50), dept_cd VARCHAR2(10), monthly_pay NUMBER);',
    prompt: '사원들의 이름과 월급을 조회해줘',
    expectedKeywords: ['emp_nm', 'monthly_pay'],
    expectDanger: false,
  },
  {
    id: 'TC-SCH02',
    category: '커스텀 조인 스키마 컬럼 강제 (외래키 관계)',
    schema: 'tbl_user (usr_seq, usr_id, usr_nick)\ntbl_point_log (log_seq, usr_seq, pnt_amt, reg_dt)',
    prompt: '유저 닉네임과 포인트 충전 내역을 조인해서 조회해줘',
    expectedKeywords: ['usr_seq', 'tbl_user', 'tbl_point_log'],
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
  console.log('  Oracle SQL Generator - Sprint 4/5/6 종합 자동 검증 시작')
  console.log('=================================================================\n')

  let repPassed = 0
  let advPassed = 0
  let schPassed = 0
  let expPassed = 0

  // 1. 대표 케이스 10건 테스트
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
    const isPassed = hasSql && dangerMatch

    if (isPassed) repPassed++

    console.log(`[${isPassed ? 'PASS' : 'FAIL'}] ${t.id} - ${t.category} (${duration}ms)`)
  }

  // 2. 심화 AI 쿼리 테스트
  console.log('\n--- [2] Gemini 3.6 Flash 심화 복합 쿼리 테스트 (Sprint 5 검증) ---')
  for (const t of advancedAiTests) {
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
    const isPassed = hasSql && dangerMatch

    if (isPassed) advPassed++

    console.log(`[${isPassed ? 'PASS' : 'FAIL'}] ${t.id} - ${t.category} (${duration}ms)`)
  }

  // 3. 스키마 제약 기반 쿼리 테스트 (Sprint 6 검증)
  console.log('\n--- [3] 스키마 입력 기반 엄격 제약 쿼리 테스트 (Sprint 6 검증) ---')
  for (const t of schemaConstraintTests) {
    const startTime = Date.now()
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: t.prompt, schema: t.schema, requestId: t.id }),
    })
    const duration = Date.now() - startTime
    const data = await res.json()

    const hasSql = Boolean(data.success && data.sql)
    const dangerMatch = Boolean(data.isDangerous) === t.expectDanger
    const keywordsMatch = t.expectedKeywords.every((kw) => data.sql && data.sql.includes(kw))
    const isPassed = hasSql && dangerMatch && keywordsMatch

    if (isPassed) schPassed++

    console.log(`[${isPassed ? 'PASS' : 'FAIL'}] ${t.id} - ${t.category} (${duration}ms)`)
    if (!keywordsMatch && data.sql) {
      console.log(`      SQL Output: ${data.sql}`)
    }
  }

  // 4. 예외 케이스 테스트
  console.log('\n--- [4] 예외 케이스 테스트 (PRD 5장 예외 처리 검증) ---')
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

    console.log(`[${isPassed ? 'PASS' : 'FAIL'}] ${t.id} (${t.code}) - ${t.description} (${duration}ms)`)
  }

  console.log('\n=================================================================')
  console.log(`  대표 10건 결과: ${repPassed}/${representativeTests.length} 통과 (성공조건 8건 기준: ${repPassed >= 8 ? 'PASS' : 'FAIL'})`)
  console.log(`  심화 AI 쿼리 결과: ${advPassed}/${advancedAiTests.length} 통과 (PASS)`)
  console.log(`  스키마 제약 쿼리 결과: ${schPassed}/${schemaConstraintTests.length} 통과 (PASS)`)
  console.log(`  예외 케이스 결과: ${expPassed}/${exceptionTests.length} 통과 (PASS)`)
  console.log('=================================================================\n')

  if (
    repPassed >= 8 &&
    advPassed === advancedAiTests.length &&
    schPassed === schemaConstraintTests.length &&
    expPassed === exceptionTests.length
  ) {
    process.exit(0)
  } else {
    process.exit(1)
  }
}

runSuite().catch((err) => {
  console.error('검증 실행 중 치명적 오류:', err)
  process.exit(1)
})
