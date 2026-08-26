# Oracle 자연어 → SQL 생성기 문서 가이드 (Docs Overview)

이 디렉터리는 **Oracle 자연어 → SQL 생성기** 프로젝트의 요구사항, 개발 계획, 테스트 케이스 및 아키텍처 문서를 체계적으로 관리하기 위한 공간입니다.

## 📁 문서 구조

```
docs/
├── README.md               # 문서 디렉터리 개요 및 관리 규칙 (본 문서)
├── PRD.md                  # 제품 요구사항 정의서 (Product Requirements Document)
├── DEVELOPMENT_PLAN.md     # 스프린트 단위 개발 계획서 (Sprint Plan & DoD)
└── TEST_CASES.md           # 대표 10건 프롬프트 및 예외 케이스 검증 시나리오
```

## 📄 핵심 문서 바로가기

1. **[PRD.md](file:///c:/Users/wlstj/oracle-sql-generator/docs/PRD.md)**
   - MVP 목표, 사용자 스토리, 10단계 화면 명세, 12개 예외 케이스(E-01 ~ E-12), 완료 조건(DoD) 수록.
2. **[DEVELOPMENT_PLAN.md](file:///c:/Users/wlstj/oracle-sql-generator/docs/DEVELOPMENT_PLAN.md)**
   - Sprint 0부터 Sprint 4까지의 단계별 태스크, 산출물, 인수 조건, 예외 우선순위 매트릭스 수록.
3. **[TEST_CASES.md](file:///c:/Users/wlstj/oracle-sql-generator/docs/TEST_CASES.md)**
   - PRD 성공조건(8/10 통과)을 만족하기 위한 대표 10건 프롬프트 및 예외 처리 검증 데이터 세트.

## 📌 문서 관리 규칙

- **단일 진실 공급원(SSOT)**: 기능이나 인터페이스에 대한 변경이 발생하면 먼저 `PRD.md`를 업데이트하고, 이에 맞추어 `DEVELOPMENT_PLAN.md`의 태스크를 조정합니다.
- **스프린트 체크리스트**: 개발이 진행됨에 따라 `DEVELOPMENT_PLAN.md`의 태스크 체크박스(`- [ ]` ➔ `- [x]`)를 갱신합니다.
