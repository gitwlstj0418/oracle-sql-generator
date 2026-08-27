# Oracle 자연어 → SQL 생성기 (Oracle SQL Generator)

Oracle 데이터베이스 작업을 자연어로 입력하면 즉시 사용할 수 있는 표준 Oracle SQL(19c/21c) 1개를 생성하고 복사할 수 있는 단일 화면 웹 서비스입니다.

![Oracle SQL Generator](public/icon.svg)

---

## 🌟 주요 기능 및 특징

1. **단일 화면 3단계 직관적 UX**: `자연어 입력 → Oracle SQL 생성 → 결과 복사`
2. **테이블 스키마 입력/업로드 지원 (환각 방지 - NEW)**:
   - 사용자가 테이블/컬럼 구조(`CREATE TABLE ...` DDL 등)를 입력하거나 `.sql`/`.txt` 파일로 업로드하면 **오직 입력된 스키마의 컬럼/테이블명만 엄격하게 사용하여 SQL 생성** (존재하지 않는 컬럼 환각 원천 차단)
   - 원클릭 샘플 스키마(HR 사원/부서, E-Commerce, 커뮤니티 등) 제공
3. **Oracle SQL 전문 문법 하이라이팅 (Syntax Highlighting - NEW)**:
   - `SELECT`, `FROM`, `WHERE`, `JOIN`, `OVER`, `DENSE_RANK()`, 문자열, 숫자, 주석 등이 색상별로 구분되는 코드 블록 제공
   - 복사 버튼 클릭 시에는 서식 없는 순수 SQL 텍스트만 클립보드로 완벽 복사
4. **Google Gemini 3.6 Flash 실시간 AI 엔진 탑재**:
   - `gemini-3.6-flash` 기반 고품질 실시간 생성 및 `Gemini` ➔ `OpenAI` ➔ `내장 Fallback` 3계층 무중단 안정망
5. **Oracle 19c/21c 전용 문법 강제**: `ROWNUM`, `FETCH FIRST n ROWS ONLY`, `SYSDATE`, `ADD_MONTHS` 등 Oracle 표준 준수
6. **위험 SQL 사전 경고**: `UPDATE`, `DELETE`, `DROP`, `TRUNCATE`, `ALTER` 감지 시 시각적 경고 배너 제공
7. **12가지 예외 상황 처리 및 우선순위 필터링**:
   - 빈 입력(`E-01`), 짧은 입력(`E-02`), 긴 입력(`E-03`), 타 DBMS 요청(`E-09`), 일상 대화(`E-07`), 모호한 요청(`E-08`) 등
8. **10초 타임아웃 및 레이스 컨디션 방지**: 늦게 도착한 이전 응답이 최신 화면을 덮어쓰지 않도록 보호
9. **클립보드 원클릭 복사**: 순수 SQL 쿼리만 클립보드로 복사하고 복사 완료 피드백 제공

---

## 🚀 빠른 시작 가이드 (Getting Started)

### 1. 패키지 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

### 3. 전체 자동화 테스트 검증 (Sprint 4 DoD)
```bash
node scripts/verify-all.mjs
```

### 4. 프로덕션 빌드
```bash
npm run build
```

---

## 📁 프로젝트 및 문서 체계 (`docs/`)

- 📑 **[docs/PRD.md](file:///c:/Users/wlstj/oracle-sql-generator/docs/PRD.md)**: 제품 요구사항 정의서 (단일 진실 공급원 - SSOT)
- 📋 **[docs/DEVELOPMENT_PLAN.md](file:///c:/Users/wlstj/oracle-sql-generator/docs/DEVELOPMENT_PLAN.md)**: 스프린트 단위 개발 계획서 (Sprint 0 ~ 4)
- 🧪 **[docs/TEST_CASES.md](file:///c:/Users/wlstj/oracle-sql-generator/docs/TEST_CASES.md)**: 대표 10건 프롬프트 및 예외 케이스 명세
- 📊 **[docs/TEST_RESULTS.md](file:///c:/Users/wlstj/oracle-sql-generator/docs/TEST_RESULTS.md)**: 자동화 검증 결과 보고서 (10/10 성공 달성)
- 📖 **[docs/README.md](file:///c:/Users/wlstj/oracle-sql-generator/docs/README.md)**: 문서 관리 가이드

---

## ⚙️ 환경 변수 설정 (`.env.local` - 선택 사항)

외부 LLM API를 연동하려면 `.env.local` 파일을 생성하여 설정합니다 (미설정 시에도 내장 Oracle SQL 엔진으로 완전 작동).

```env
# Gemini API Key (선택)
GEMINI_API_KEY=your_gemini_api_key

# OpenAI API Key (선택)
OPENAI_API_KEY=your_openai_api_key
```
