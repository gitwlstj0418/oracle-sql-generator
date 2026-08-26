# Oracle 자연어 → SQL 생성기 PRD

> ℹ️ 상세 문서는 [docs/PRD.md](file:///c:/Users/wlstj/oracle-sql-generator/docs/PRD.md) 및 [docs/DEVELOPMENT_PLAN.md](file:///c:/Users/wlstj/oracle-sql-generator/docs/DEVELOPMENT_PLAN.md)에서 지속적으로 관리됩니다.

## 1) 목표와 성공조건

### 1.1 목표
Oracle DB에서 수행하고 싶은 작업을 자연어로 입력하면, 사용자가 참고하거나 복사해 사용할 수 있는 **Oracle SQL 쿼리 1개를 생성하는 단일 화면 서비스**를 만든다.

서비스의 핵심 흐름은 아래 3단계로 제한한다.
**자연어 입력 → Oracle SQL 생성 → 결과 복사**

로그인, 결제, 실제 DB 연결, SQL 실행, 저장 기능은 제공하지 않는다.

### 1.2 해결하려는 문제
Oracle SQL 문법에 익숙하지 않은 개발자, 기획자, 운영 담당자는 단순한 조회·생성·수정·삭제 작업도 직접 SQL로 변환해야 한다.

### 1.3 MVP 범위
* 조회: `SELECT`
* 생성/추가: `INSERT`
* 수정: `UPDATE`
* 삭제: `DELETE`
* 테이블 생성 등 구조 생성: `CREATE`

### 1.4 성공조건
1. 사용자가 최초 화면 진입 후 **1분 이내에 자연어 입력 → SQL 생성 → 복사**를 완료할 수 있다.
2. 사전에 준비한 대표 자연어 요청 10건 중 **8건 이상에서 사용자의 의도와 일치하는 Oracle SQL 초안이 생성된다.**
3. 별도 로그인이나 초기 설정 없이 즉시 사용할 수 있다.
4. 생성된 결과는 Oracle SQL 형태로 출력된다.
5. 생성된 SQL을 한 번의 동작으로 복사할 수 있다.
6. 오류 상황에서는 사용자가 다음 행동을 알 수 있도록 화면에 오류 문구가 표시된다.

---
전체 상세 명세는 [docs/PRD.md](file:///c:/Users/wlstj/oracle-sql-generator/docs/PRD.md)를 참고하세요.
