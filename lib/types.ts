export type SqlErrorCode =
  | 'E-01' // 입력값이 비어 있음
  | 'E-02' // 입력값이 너무 짧음
  | 'E-03' // 입력값이 너무 김
  | 'E-04' // AI 응답 자체가 실패함
  | 'E-05' // 응답 시간이 10초 이상 걸림 (타임아웃)
  | 'E-06' // AI 응답에 정상적인 SQL이 없음
  | 'E-07' // 입력 내용이 DB 작업으로 판단하기 어려움
  | 'E-08' // 요청의 대상 정보가 부족함
  | 'E-09' // 다른 DBMS 문법을 요청함
  | 'E-10' // 결과가 위험한 SQL인 경우 (경고용)
  | 'E-11' // 복사할 결과가 없음
  | 'E-12' // 복사 동작 실패

export type DangerousKeyword = 'UPDATE' | 'DELETE' | 'DROP' | 'TRUNCATE' | 'ALTER'

export interface SqlAnalysisResult {
  isDangerous: boolean
  dangerousKeywords: DangerousKeyword[]
  sqlType?: string
}

export interface GenerateSqlRequest {
  prompt: string
  schema?: string
  requestId?: string
}

export interface GenerateSqlResponse {
  success: boolean
  sql?: string
  isDangerous?: boolean
  dangerousKeywords?: DangerousKeyword[]
  warningMessage?: string
  errorCode?: SqlErrorCode
  errorMessage?: string
  requestId?: string
}

export type GeneratorUiStatus =
  | 'idle' // 최초 진입 / 대기 상태
  | 'loading' // SQL 생성 중
  | 'success' // SQL 생성 성공
  | 'error' // 오류 발생

export interface GeneratorState {
  prompt: string
  schema: string
  status: GeneratorUiStatus
  sql: string | null
  isDangerous: boolean
  warningMessage: string | null
  inputError: string | null
  resultError: string | null
  copyFeedback: string | null
  copyError: string | null
  activeRequestId: string | null
}
