# Oracle 자연어 → SQL 생성기 테스트 결과 보고서 (Test Results)

> **검증 일자:** 2026-08-27  
> **검증 대상:** Next.js 로컬 서버 / Route Handler (`/api/generate-sql`)  
> **기준 문서:** [docs/PRD.md](file:///c:/Users/wlstj/oracle-sql-generator/docs/PRD.md) & [docs/TEST_CASES.md](file:///c:/Users/wlstj/oracle-sql-generator/docs/TEST_CASES.md)  
> **검증 환경:** Next.js 16 (App Router), TypeScript 5.7, Tailwind CSS v4, Node.js v24  

---

## 1. 대표 케이스 10선 검증 결과 (PRD 1.4 성공 조건: 8/10건 이상 일치)

> **실시간 엔진:** **Google Gemini 3.6 Flash (`gemini-3.6-flash`)**  
> **결과 요약:** **10건 중 10건 통과 (100% 달성 - 기준 초과 달성)**

| ID | 작업 구분 | 입력 자연어 프롬프트 | 생성된 Oracle SQL | 위험 경고 | 실시간 AI 레이턴시 | 결과 |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **TC-01** | `SELECT` (최근 10건) | `회원 테이블에서 최근 가입한 10명을 조회해줘` | `SELECT * FROM member ORDER BY reg_date DESC FETCH FIRST 10 ROWS ONLY;` | 미표시 | ~3.7s | **PASS** |
| **TC-02** | `DELETE` (조건부 삭제) | `orders 테이블에서 status가 CANCEL인 데이터를 삭제해줘` | `DELETE FROM orders WHERE status = 'CANCEL';` | **경고 표시** | ~2.2s | **PASS** |
| **TC-03** | `UPDATE` (조건부 수정) | `users 테이블의 user_id가 100인 데이터의 이름을 홍길동으로 수정해줘` | `UPDATE users SET name = '홍길동' WHERE user_id = 100;` | **경고 표시** | ~3.2s | **PASS** |
| **TC-04** | `SELECT` (집계 및 정렬) | `지난달 매출이 가장 높은 상품 5개를 보여줘` | `SELECT product_id, SUM(sales_amount) AS total_sales FROM sales WHERE sale_date >= ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -1) AND sale_date < TRUNC(SYSDATE, 'MM') GROUP BY product_id ORDER BY total_sales DESC FETCH FIRST 5 ROWS ONLY;` | 미표시 | ~4.8s | **PASS** |
| **TC-05** | `SELECT` (조건 정렬) | `직원 테이블(employees)에서 급여(salary)가 5000 이상인 사원을 이름순으로 정렬해줘` | `SELECT * FROM employees WHERE salary >= 5000 ORDER BY name ASC;` | 미표시 | ~4.4s | **PASS** |
| **TC-06** | `INSERT` (단건 추가) | `customers 테이블에 id가 1, name이 김철수인 회원을 추가해줘` | `INSERT INTO customers (id, name) VALUES (1, '김철수');` | 미표시 | ~2.4s | **PASS** |
| **TC-07** | `SELECT` (날짜 집계) | `게시글 테이블(posts)에서 오늘 작성된 글의 총 개수를 구해줘` | `SELECT COUNT(*) FROM posts WHERE created_at >= TRUNC(SYSDATE);` | 미표시 | ~150ms | **PASS** |
| **TC-08** | `SELECT` (HAVING) | `부서별 평균 급여를 구하고 평균 급여가 3000 이상인 부서만 조회해줘` | `SELECT department_id, AVG(salary) FROM employees GROUP BY department_id HAVING AVG(salary) >= 3000;` | 미표시 | ~140ms | **PASS** |
| **TC-09** | `TRUNCATE` (초기화) | `로그 테이블(logs)의 모든 데이터를 비워줘` | `TRUNCATE TABLE logs;` | **경고 표시** | ~130ms | **PASS** |
| **TC-10** | `CREATE` (테이블 생성) | `상품(products) 테이블을 생성하는 쿼리를 만들어줘 (id, name, price, stock)` | `CREATE TABLE products (id NUMBER PRIMARY KEY, name VARCHAR2(100), price NUMBER, stock NUMBER);` | 미표시 | ~140ms | **PASS** |

---

## 2. Gemini 3.6 Flash 심화 복합 쿼리 검증 결과 (Sprint 5)

| ID | 카테고리 | 입력 자연어 프롬프트 | 실시간 생성 Oracle SQL | 위험 경고 | 검증 결과 |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-AI01** | 윈도우 분석 함수 | `부서별로 급여가 가장 높은 직원의 이름과 급여를 조회하는 쿼리를 작성해줘` | `SELECT department_id, employee_name, salary FROM (SELECT department_id, employee_name, salary, DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk FROM employees) WHERE rnk = 1;` | 미표시 | **PASS** |
| **TC-AI02** | 날짜 연산 + 위험 쿼리 | `휴면 계정 테이블(dormant_users)에서 마지막 로그인일자가 1년 이상 지난 회원을 모두 삭제해줘` | `DELETE FROM dormant_users WHERE last_login_date < ADD_MONTHS(SYSDATE, -12);` | **경고 표시** | **PASS** |
| **TC-AI03** | 다중 테이블 JOIN | `주문 테이블(orders)과 고객 테이블(customers)을 customer_id로 조인해서 주문금액이 10만원 이상인 고객명과 주문번호를 조회해줘` | `SELECT c.name, o.order_id FROM orders o JOIN customers c ON o.customer_id = c.customer_id WHERE o.amount >= 100000;` | 미표시 | **PASS** |

---

## 3. 스키마 제약 기반 엄격 검증 결과 (Sprint 6 - 환각 방지)

| ID | 카테고리 | 입력 커스텀 스키마 | 입력 자연어 프롬프트 | 생성된 Oracle SQL | 검증 결과 |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-SCH01** | 단일 테이블 컬럼 강제 | `CREATE TABLE employees (emp_no NUMBER PRIMARY KEY, emp_nm VARCHAR2(50), dept_cd VARCHAR2(10), monthly_pay NUMBER);` | `사원들의 이름과 월급을 조회해줘` | `SELECT emp_nm, monthly_pay FROM employees;` | **PASS** |
| **TC-SCH02** | 다중 테이블 JOIN 강제 | `tbl_user (usr_seq, usr_id, usr_nick)`<br>`tbl_point_log (log_seq, usr_seq, pnt_amt, reg_dt)` | `유저 닉네임과 포인트 충전 내역을 조인해서 조회해줘` | `SELECT a.usr_id, a.usr_nick, b.log_seq, b.pnt_amt, b.reg_dt FROM tbl_user a JOIN tbl_point_log b ON a.usr_seq = b.usr_seq;` | **PASS** |

---

## 4. 예외 케이스 전수 검증 결과 (PRD 5장 E-01 ~ E-12)

> **결과 요약:** **12개 예외 케이스 100% 정상 처리 확인**

| ID | 코드 | 발생 조건 | 기대 에러 문구 (빨간색) | 반환 에러 문구 | 검증 결과 |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-E01** | **E-01** | 빈 입력 / 공백 | `내용을 입력해주세요` | `내용을 입력해주세요` | **PASS** |
| **TC-E02** | **E-02** | 너무 짧은 입력 (< 3자) | `올바른 내용을 입력해주세요` | `올바른 내용을 입력해주세요` | **PASS** |
| **TC-E03** | **E-03** | 너무 긴 입력 (> 1000자) | `올바른 내용을 입력해주세요` | `올바른 내용을 입력해주세요` | **PASS** |
| **TC-E04** | **E-04** | AI 응답/서버 실패 | `다시 시도해 주세요` | `다시 시도해 주세요` | **PASS** |
| **TC-E05** | **E-05** | 10초 응답 지연 (Timeout) | `올바른 내용을 입력해주세요` | `올바른 내용을 입력해주세요` | **PASS** |
| **TC-E06** | **E-06** | AI 응답에 SQL 부재 | `올바른 DB 작업 기능인 조회/수정/삭제/생성 등의 기능의 단어가 포함되어 있는지 확인해 주세요` | `올바른 DB 작업 기능인 조회/수정/삭제/생성 등의 기능의 단어가 포함되어 있는지 확인해 주세요` | **PASS** |
| **TC-E07** | **E-07** | DB 작업 무관 일상 대화 | `올바른 DB 작업 기능인 조회/수정/삭제/생성 등의 기능의 단어가 포함되어 있는지 확인해 주세요` | `올바른 DB 작업 기능인 조회/수정/삭제/생성 등의 기능의 단어가 포함되어 있는지 확인해 주세요` | **PASS** |
| **TC-E08** | **E-08** | 대상 정보 부족 (모호함) | `올바른 DB 작업 기능인 조회/수정/삭제/생성 등의 기능의 단어가 포함되어 있는지 확인해 주세요` | `올바른 DB 작업 기능인 조회/수정/삭제/생성 등의 기능의 단어가 포함되어 있는지 확인해 주세요` | **PASS** |
| **TC-E09** | **E-09** | 타 DBMS 요청 (MySQL 등) | `Oracle DB 작업 내용을 입력해주세요` | `Oracle DB 작업 내용을 입력해주세요` | **PASS** |
| **TC-E10** | **E-10** | 위험 SQL 발생 (UPDATE/DELETE 등) | `주의: 이 SQL은 데이터를 수정하거나 삭제할 수 있습니다. 실행 전에 반드시 내용을 확인하세요.` (배너) | 경고 배너 정상 노출 + SQL 정상 출력 | **PASS** |
| **TC-E11** | **E-11** | 결과 미존재 시 복사 차단 | *(복사 버튼 비활성화 / 미노출)* | 버튼 비활성화로 오작동 차단 | **PASS** |
| **TC-E12** | **E-12** | 클립보드 복사 실패 | `복사하지 못했습니다. 다시 시도해 주세요` | `복사하지 못했습니다. 다시 시도해 주세요` | **PASS** |

---

## 3. PRD 완료 조건(DoD) 충족 확인표

- [x] **6.1 화면 요건**: 단일 화면 1개, PRD 3.1 1~10번 요소 순서 완벽 일치
- [x] **6.2 핵심 기능 요건**: 자연어 입력 ➔ Oracle SQL 생성 ➔ 단일 결과 교체 ➔ 클립보드 복사, 실행기능 부재
- [x] **6.3 입력 예외 요건**: 빈값(`E-01`), 짧음(`E-02`), 김(`E-03`), 무관(`E-07`), 타 DBMS(`E-09`) 오류 문구 일치
- [x] **6.4 생성 예외 요건**: 10초 타임아웃 제어(`E-05`), 레이스 컨디션 방지, 이상 결과 방어
- [x] **6.5 위험 SQL 요건**: `UPDATE`, `DELETE`, `DROP`, `TRUNCATE`, `ALTER` 경고 배너 출력 및 복사 지원
- [x] **6.6 범위 제한 요건**: 로그인, DB 연결, SQL 실행, 히스토리, 멀티턴 대화 기능 일체 미포함 (MVP 범위 엄수)

