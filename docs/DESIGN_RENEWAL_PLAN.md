# SQLForge Pro 톤앤매너 개편 계획서

> 기준 문서: 루트의 `desgin.md` (`Technical Precision (SQLForge Pro)`)
>
> 작성일: 2026-08-27  
> 대상: Oracle 자연어 → SQL 생성기 전체 단일 페이지  
> 원칙: 기존 기능과 데이터 흐름은 유지하고 시각 체계, 정보 위계, 상호작용 표현을 개편한다.

## 1. 개편 목표

현재의 부드러운 카드형 서비스 화면을 Oracle 전용 개발 도구에 어울리는 정밀하고 신뢰감 있는 인터페이스로 전환한다.

- Oracle Red(`#c70000`)를 제품 식별자와 핵심 행동에 일관되게 사용한다.
- 짙은 네이비(`#1a2b3c`)와 무채색 표면을 조합해 기술 도구의 안정감을 만든다.
- 과도한 그라데이션, 큰 모서리, 장식적인 그림자를 줄이고 데이터와 기능 중심의 위계를 만든다.
- SQL 결과는 어두운 코드 표면과 JetBrains Mono를 사용해 편집기와 유사한 가독성을 제공한다.
- 사용자가 `스키마 설정 → 요청 입력 → 생성 → 검토·복사` 흐름을 즉시 이해하도록 간격과 상태 표현을 정리한다.
- 모바일과 데스크톱에서 동일한 기능 우선순위와 접근성을 유지한다.

## 2. 변경하지 않는 범위

이번 개편은 디자인 리뉴얼이며 아래 동작은 유지한다.

- `/api/generate-sql` 요청·응답 규격
- Gemini/OpenAI/내장 폴백 생성 흐름
- 입력 길이 검증과 10초 타임아웃
- 위험 SQL 판정 로직
- 스키마 입력·파일 선택 기능
- 클립보드 복사와 기존 오류 코드·문구
- 실제 DB 연결이나 SQL 실행 기능을 추가하지 않음

## 3. 현행 UI와 디자인 기준의 차이

| 영역 | 현행 | 목표 |
|---|---|---|
| 제품 색상 | 중성색 및 범용 primary | Oracle Red 중심의 명확한 브랜드 체계 |
| 배경 | 연한 그라데이션 | `#f8f9ff` 단색 기반의 정돈된 작업 공간 |
| 표면 | 큰 카드 한 개 | 흰색 표면과 얇은 outline으로 구획된 작업 패널 |
| 모서리 | `rounded-xl`~`rounded-2xl` | 기본 4px, 필요한 요소만 8px 이하 |
| 그림자 | 여러 요소에 `shadow-sm` | 기본 무그림자, 핵심 패널에만 low elevation |
| 본문 서체 | Noto Sans KR | Inter 우선, 한글은 Noto Sans KR/system fallback |
| 코드 서체 | 시스템 monospace | JetBrains Mono 우선 |
| 코드 화면 | 밝은 카드 배경 | `#1a1c1e` 기반 전용 코드 표면 |
| CTA | 범용 primary 버튼 | 48px 높이의 Oracle Red 고대비 버튼 |
| 상태 표현 | 카드와 유사한 라운드 알림 | 색상·아이콘·좌측 강조선 중심의 간결한 상태 바 |

## 4. 디자인 토큰 적용 계획

### 4.1 색상

`app/globals.css`의 기존 의미 기반 변수는 유지하되 `desgin.md`의 값을 연결한다. 컴포넌트에서 hex 값을 반복하지 않고 `primary`, `secondary`, `surface`, `outline`, `error`, `success`, `code-*` 토큰만 사용한다.

- `background`: `#f8f9ff`
- `foreground/on-background`: `#1a1c1e`
- `primary`: `#c70000`
- `primary-foreground`: `#ffffff`
- `secondary`: `#1a2b3c`
- `surface/card`: `#ffffff`
- `surface-variant/muted`: `#f1f3f7`
- `outline/border/input`: `#c4c7cf`
- `destructive/error`: `#ba1a1a`
- `success`: `#1a8a3a`
- `code-bg`: `#1a1c1e`
- `code-text`: `#e2e2e6`
- `code-keyword`: `#ff7b72`
- `code-string`: `#a5d6ff`

현재 자동 다크 모드는 새 디자인 문서에 별도 명세가 없으므로 1차 구현에서는 라이트 작업 화면을 기준으로 일관성을 확보한다. 기존 다크 관련 클래스는 임의로 혼합하지 않고, 유지 여부를 구현 시 한 번에 결정한다.

### 4.2 타이포그래피

- UI 영문·숫자: Inter
- 한글 fallback: Noto Sans KR 및 시스템 sans-serif
- SQL·테이블명·수치: JetBrains Mono
- 화면 제목: 40px/700, 모바일에서는 32px 수준으로 축소
- 섹션 제목: 20px/600
- 본문: 16px/400, line-height 1.6
- 레이블·보조 설명: 14px/500
- 코드: 14px/400, line-height 1.5

`next/font` 적용 전에는 설치된 Next.js 16 문서의 폰트 가이드를 확인하고, 한글 fallback 및 네트워크 없는 빌드 환경도 함께 검증한다.

### 4.3 간격·형태·깊이

- 4px 단위 간격 체계를 적용한다.
- 모바일 좌우 여백은 20px, 데스크톱은 40px을 기본으로 한다.
- 입력은 최소 56px, 주요 버튼은 48px 높이를 유지한다.
- 기본 radius는 4px로 줄이고 배지와 상태 점 등 의미가 있는 요소에만 pill 형태를 사용한다.
- 그림자는 페이지 장식이 아니라 패널 계층 표현이 필요한 위치에만 low elevation을 사용한다.
- focus ring은 Oracle Red 계열로 통일하고 키보드 탐색에서 충분히 식별되도록 한다.

## 5. 화면 및 컴포넌트별 작업

### 5.1 전역 레이아웃과 헤더

대상: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

- 배경 그라데이션을 제거하고 단색 작업 공간으로 변경한다.
- 제품명, Oracle 호환성, 한 줄 설명의 위계를 재정렬한다.
- 현재의 장식적인 pill 배지는 기술 상태 라벨 형태로 단순화한다.
- 최대 콘텐츠 너비와 상하 여백을 재조정해 데스크톱에서 입력과 결과가 답답하지 않게 한다.
- 페이지 하단의 “실제 DB에서 실행되지 않음” 안내는 보조 정보 영역으로 명확하게 유지한다.

### 5.2 메인 작업 패널

대상: `app/page.tsx`

- 큰 `rounded-2xl` 카드에서 얇은 outline과 4px radius의 작업 패널로 전환한다.
- 스키마, 자연어 요청, 실행, 결과 영역을 간격과 구분선으로 명확히 나눈다.
- 장식적 아이콘 사용은 줄이되 작업 유형이나 상태를 설명하는 아이콘은 유지한다.
- 작은 화면에서는 세로 흐름을 유지하고, 버튼·업로드 컨트롤이 줄바꿈되어도 탭 순서가 자연스럽도록 한다.

### 5.3 스키마 입력 영역

대상: `components/schema-input.tsx`

- 아코디언을 개발 도구의 설정 패널처럼 평평하고 조밀한 형태로 변경한다.
- “선택 사항”, 적용 상태, 문자 수의 정보 위계를 정리한다.
- 파일 업로드, 초기화, 펼침 버튼의 높이와 포커스 상태를 통일한다.
- 샘플 스키마 버튼은 장식적인 칩보다 보조 액션 버튼에 가깝게 표현한다.
- 디자인 작업에서는 기존 파일 선택 동작을 유지하며 드래그앤드롭 같은 새 기능은 추가하지 않는다.

### 5.4 자연어 입력과 생성 CTA

대상: `app/page.tsx`, `components/ui/button.tsx`

- 입력 테두리, 레이블, 글자 수, 단축키 안내를 명확한 폼 계층으로 정리한다.
- 기본 CTA를 Oracle Red, 흰색 텍스트, 48px 높이, 4px radius로 변경한다.
- hover, active, focus-visible, disabled, loading 상태를 토큰 기준으로 정의한다.
- 예시 프롬프트는 primary를 경쟁하지 않는 secondary/outline 액션으로 낮춘다.
- 로딩 시 버튼 폭과 레이아웃이 변하지 않게 유지한다.

### 5.5 SQL 결과 뷰어와 구문 강조

대상: `components/sql-viewer.tsx`, `components/sql-highlighter.tsx`

- 결과 본문을 `code-bg` 기반의 어두운 코드 블록으로 전환한다.
- 줄 번호, 일반 텍스트, 키워드, 문자열, 숫자, 주석, 위험 키워드의 대비를 새 팔레트에 맞춘다.
- 헤더는 secondary 계열의 기술 툴바로 만들고 Oracle 버전, 구문 강조, 위험 상태를 간결하게 표시한다.
- 긴 SQL의 가로 스크롤, 여러 줄 SQL의 줄 번호 정렬, 텍스트 선택 가능 상태를 유지한다.
- 빈 결과 상태는 코드 블록과 구분되는 밝은 표면으로 유지하되 불필요한 장식을 줄인다.

### 5.6 경고·오류·성공 상태

대상: `components/danger-alert.tsx`, `components/error-alert.tsx`, `app/page.tsx`

- 위험 SQL은 amber 계열 경고 의미를 유지하되 제품 primary와 혼동되지 않도록 한다.
- 오류는 `error` 토큰, 복사 성공은 `success` 토큰을 사용한다.
- 상태 박스는 큰 라운드 카드 대신 좌측 강조선, 아이콘, 짧은 본문 중심으로 구성한다.
- `role="alert"`, `role="status"`와 텍스트 메시지를 유지하여 색상만으로 상태를 전달하지 않는다.

### 5.7 공통 버튼

대상: `components/ui/button.tsx`

- 기본, outline, secondary, destructive 변형을 새 토큰과 4px radius 체계에 맞춘다.
- 공통 버튼 변경이 업로드, 초기화, 생성, 복사에 미치는 영향을 함께 확인한다.
- 최소 클릭 영역, disabled 대비, focus-visible 표현을 검증한다.

## 6. 구현 순서

### Phase 1. 기반 토큰과 폰트

1. Next.js 16의 로컬 설치 문서에서 font와 global CSS 관련 현재 규칙을 확인한다.
2. `globals.css`에 색상, 서체, radius, elevation, 코드 팔레트를 정의한다.
3. `layout.tsx`에서 Inter·JetBrains Mono·한글 fallback 전략을 적용한다.
4. 기존 dark 변수와 새 라이트 기준의 충돌을 제거한다.

### Phase 2. 공통 원자 요소

1. 공통 Button 변형과 상태를 수정한다.
2. 폼 입력, 포커스 링, 보조 버튼, 상태 라벨의 공통 표현을 정한다.
3. 오류·위험 알림을 새 상태 스타일로 변경한다.

### Phase 3. 페이지와 입력 경험

1. 전체 배경, 헤더, 콘텐츠 폭, 메인 패널을 개편한다.
2. 스키마 아코디언과 자연어 입력 영역을 정리한다.
3. 예시 프롬프트, 문자 수, 단축키, 로딩 상태의 위계를 조정한다.

### Phase 4. SQL 결과 경험

1. 결과 뷰어를 어두운 코드 패널로 전환한다.
2. 새 코드 토큰에 맞게 구문 강조 색상을 조정한다.
3. 위험 배지, 빈 상태, 복사 영역을 일관된 도구 UI로 통합한다.

### Phase 5. 반응형·접근성·회귀 검증

1. 360px, 768px, 1280px 이상 화면에서 레이아웃을 확인한다.
2. 키보드만으로 아코디언, 입력, 예시, 생성, 복사를 사용할 수 있는지 확인한다.
3. 포커스 표시, 텍스트 대비, 상태의 비색상 단서를 확인한다.
4. 빈 입력, 로딩, 성공, 위험 SQL, API 오류, 복사 성공·실패 상태를 각각 시각 검증한다.
5. TypeScript 검사와 프로덕션 빌드를 실행하고 기존 SQL 생성 흐름의 회귀 여부를 확인한다.

## 7. 완료 기준

- [ ] Oracle Red가 주요 CTA와 핵심 제품 식별자에만 일관되게 사용된다.
- [ ] 배경, 표면, outline, secondary 색상이 `desgin.md` 토큰과 일치한다.
- [ ] 기본 radius가 4px 체계로 정리되고 불필요한 pill·큰 라운드가 제거된다.
- [ ] Inter/한글 fallback 및 JetBrains Mono가 역할별로 적용된다.
- [ ] 생성 버튼 높이가 48px이고 입력·버튼의 모든 상호작용 상태가 구분된다.
- [ ] SQL 결과가 어두운 코드 표면에서 충분한 대비로 표시된다.
- [ ] 오류, 위험, 성공, 로딩 상태가 색상 외 아이콘과 텍스트로도 구분된다.
- [ ] 모바일과 데스크톱에서 가로 넘침 없이 핵심 흐름을 완료할 수 있다.
- [ ] 기존 API, SQL 생성, 복사, 스키마 입력 기능에 동작 변경이 없다.
- [ ] TypeScript 검사와 프로덕션 빌드가 통과한다.

## 8. 예상 수정 파일

필수 변경 대상:

- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `components/ui/button.tsx`
- `components/schema-input.tsx`
- `components/sql-viewer.tsx`
- `components/sql-highlighter.tsx`
- `components/danger-alert.tsx`
- `components/error-alert.tsx`

기능 로직 파일인 `hooks/use-sql-generator.ts`, `lib/*`, `app/api/*`는 디자인 구현 중 동작 변경 없이 유지한다.

## 9. 주요 리스크와 대응

- **Oracle Red 과사용:** CTA, focus, 핵심 식별자 외에는 surface/secondary를 사용해 시각적 피로를 방지한다.
- **한글 가독성 저하:** Inter 단독 적용을 피하고 Noto Sans KR fallback을 명시한다.
- **코드 색상 대비 부족:** 코드 배경에서 키워드·문자열·주석의 대비를 상태별로 직접 확인한다.
- **공통 버튼 회귀:** Button 변경 후 생성·복사·업로드·초기화 버튼을 전부 점검한다.
- **다크 모드 혼선:** 디자인 기준에 없는 다크 UI를 부분적으로 남기지 않고 라이트 기준 정책을 명확히 결정한다.
- **기능 범위 확장:** 이번 작업은 시각 개편으로 제한하고 드래그앤드롭, API 변경, SQL 로직 개선은 별도 과제로 분리한다.

