# Oracle 자연어 → SQL 생성기 테스트 케이스 명세서 (Test Cases)

본 문서는 **PRD 1.4 성공 조건(10건 중 8건 이상 일치)** 및 **PRD 5장 예외 처리(E-01 ~ E-12)** 요건을 충족하는지 검증하기 위한 표준 테스트 시나리오 목록입니다.

---

## 1. 대표 성공 테스트 케이스 10선 (성공 조건 1.4 검증)

| ID | 작업 구분 | 입력 자연어 프롬프트 | 기대 생성 Oracle SQL (예시) | 위험 경고 여부 |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | `SELECT` (조회 / 페이징) | `회원 테이블에서 최근 가입한 10명을 조회해줘` | `SELECT * FROM (SELECT * FROM members ORDER BY created_at DESC) WHERE ROWNUM <= 10;` (또는 `FETCH FIRST 10 ROWS ONLY`) | 미표시 |
| **TC-02** | `DELETE` (조건부 삭제) | `orders 테이블에서 status가 CANCEL인 데이터를 삭제해줘` | `DELETE FROM orders WHERE status = 'CANCEL';` | **경고 표시** |
| **TC-03** | `UPDATE` (조건부 수정) | `users 테이블의 user_id가 100인 데이터의 이름을 홍길동으로 수정해줘` | `UPDATE users SET name = '홍길동' WHERE user_id = 100;` | **경고 표시** |
| **TC-04** | `SELECT` (집계 및 정렬) | `지난달 매출이 가장 높은 상품 5개를 보여줘` | `SELECT product_id, SUM(sales_amount) FROM sales WHERE sale_date >= ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -1) AND sale_date < TRUNC(SYSDATE, 'MM') GROUP BY product_id ORDER BY SUM(sales_amount) DESC FETCH FIRST 5 ROWS ONLY;` | 미표시 |
| **TC-05** | `SELECT` (조건 및 정렬) | `직원 테이블(employees)에서 급여(salary)가 5000 이상인 사원을 이름순으로 정렬해줘` | `SELECT * FROM employees WHERE salary >= 5000 ORDER BY name ASC;` | 미표시 |
| **TC-06** | `INSERT` (단건 추가) | `customers 테이블에 id가 1, name이 김철수인 회원을 추가해줘` | `INSERT INTO customers (id, name) VALUES (1, '김철수');` | 미표시 |
| **TC-07** | `SELECT` (날짜 조건 집계) | `게시글 테이블(posts)에서 오늘 작성된 글의 총 개수를 구해줘` | `SELECT COUNT(*) FROM posts WHERE created_at >= TRUNC(SYSDATE);` | 미표시 |
| **TC-08** | `SELECT` (GROUP BY / HAVING) | `부서별 평균 급여를 구하고 평균 급여가 3000 이상인 부서만 조회해줘` | `SELECT department_id, AVG(salary) AS avg_sal FROM employees GROUP BY department_id HAVING AVG(salary) >= 3000;` | 미표시 |
| **TC-09** | `TRUNCATE` (데이터 초기화) | `로그 테이블(logs)의 모든 데이터를 비워줘` | `TRUNCATE TABLE logs;` | **경고 표시** |
| **TC-10** | `CREATE` (테이블 생성) | `상품(products) 테이블을 생성하는 쿼리를 만들어줘 (id, name, price, stock)` | `CREATE TABLE products (id NUMBER PRIMARY KEY, name VARCHAR2(100), price NUMBER, stock NUMBER);` | 미표시 |

---

## 2. 예외 처리 테스트 케이스 (E-01 ~ E-12)

| ID | 예외 코드 | 테스트 입력값 / 시나리오 | 기대 에러 문구 (빨간색) | 기대 UI 동작 |
| :--- | :--- | :--- | :--- | :--- |
| **TC-E01** | **E-01** | `""` (공백 또는 빈 문자열) | `내용을 입력해주세요` | AI 호출 방지, 입력창 하단 에러 표시 |
| **TC-E02** | **E-02** | `"조회"` (2자 이하의 지나치게 짧은 입력) | `올바른 내용을 입력해주세요` | AI 호출 방지, 입력창 하단 에러 표시 |
| **TC-E03** | **E-03** | 1000자 초과의 대량 로그/문서 입력 | `올바른 내용을 입력해주세요` | AI 호출 방지, 기존 SQL 결과 초기화 |
| **TC-E04** | **E-04** | 네트워크 끊김 또는 AI 서버 500 에러 | `다시 시도해 주세요` | 버튼 재활성화, 결과 영역 에러 표시 |
| **TC-E05** | **E-05** | 10초 동안 응답 지연 (Timeout) | `올바른 내용을 입력해주세요` | 10초 경과 즉시 로딩 종료 및 에러 표시, 뒤늦은 응답 무시 |
| **TC-E06** | **E-06** | AI가 SQL 없이 설명 텍스트만 반환 | `올바른 DB 작업 기능인 조회/수정/삭제/생성 등의 기능의 단어가 포함되어 있는지 확인해 주세요` | 결과 영역에 SQL 미표시, 에러 표시 |
| **TC-E07** | **E-07** | `"오늘 점심 뭐 먹을까?"` (DB 무관 일상 대화) | `올바른 DB 작업 기능인 조회/수정/삭제/생성 등의 기능의 단어가 포함되어 있는지 확인해 주세요` | AI 응답 분석 후 에러 표시 |
| **TC-E08** | **E-08** | `"데이터를 삭제해줘"` (대상 테이블/조건 부재) | `올바른 DB 작업 기능인 조회/수정/삭제/생성 등의 기능의 단어가 포함되어 있는지 확인해 주세요` | 후속 질문 없이 에러 표시 |
| **TC-E09** | **E-09** | `"MySQL 쿼리로 회원 10명 조회해줘"` | `Oracle DB 작업 내용을 입력해주세요` | 타 DBMS 요청 차단 및 에러 표시 |
| **TC-E10** | **E-10** | `"users 테이블의 status를 DELETE로 변경해줘"` | `주의: 이 SQL은 데이터를 수정하거나 삭제할 수 있습니다. 실행 전에 반드시 내용을 확인하세요.` | 정상 SQL 결과 출력 + 상단 위험 경고 배너 |
| **TC-E11** | **E-11** | 초기 상태 또는 에러 상태에서 복사 시도 | *(복사 버튼 비활성화 또는 숨김)* | 복사 클릭 불가 |
| **TC-E12** | **E-12** | 클립보드 접근 권한 거부 상황 | `복사하지 못했습니다. 다시 시도해 주세요` | SQL 결과는 유지, 에러 문구 표시 |

---

## 3. UI 및 사용자 흐름 검증 시나리오

1. **상태 초기화 흐름 (PRD 5.14 검증)**
   - 에러가 표시된 상태에서 입력창 텍스트 수정 ➔ 에러 문구 즉시 제거 및 이전 SQL 초기화 확인.
   - `SQL 생성` 재클릭 ➔ 이전 에러 제거 후 `SQL을 생성하고 있습니다.` 로딩 인디케이터 표시 확인.
2. **복사 피드백 흐름 (PRD 3.7 검증)**
   - 정상 SQL 생성 후 `복사` 클릭 ➔ 클립보드에 정확한 SQL 텍스트 복사 확인 ➔ `복사되었습니다.` 텍스트 표시 확인.
