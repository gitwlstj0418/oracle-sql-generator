import { DangerousKeyword, SqlErrorCode } from './types'

/**
 * PRD 5.2 예외 코드별 정확한 한글 오류 문구 매핑 (빨간색 표시 대상)
 */
export const ERROR_MESSAGES: Record<SqlErrorCode, string> = {
  'E-01': '내용을 입력해주세요',
  'E-02': '올바른 내용을 입력해주세요',
  'E-03': '올바른 내용을 입력해주세요',
  'E-04': '다시 시도해 주세요',
  'E-05': '올바른 내용을 입력해주세요',
  'E-06': '올바른 DB 작업 기능인 조회/수정/삭제/생성 등의 기능의 단어가 포함되어 있는지 확인해 주세요',
  'E-07': '올바른 DB 작업 기능인 조회/수정/삭제/생성 등의 기능의 단어가 포함되어 있는지 확인해 주세요',
  'E-08': '올바른 DB 작업 기능인 조회/수정/삭제/생성 등의 기능의 단어가 포함되어 있는지 확인해 주세요',
  'E-09': 'Oracle DB 작업 내용을 입력해주세요',
  'E-10': '주의: 이 SQL은 데이터를 수정하거나 삭제할 수 있습니다. 실행 전에 반드시 내용을 확인하세요.',
  'E-11': '', // 복사 버튼 비활성화/숨김 (화면 문구 없음)
  'E-12': '복사하지 못했습니다. 다시 시도해 주세요',
}

/**
 * PRD 3.8 위험 SQL 경고 문구
 */
export const DANGEROUS_SQL_WARNING =
  '주의: 이 SQL은 데이터를 수정하거나 삭제할 수 있습니다. 실행 전에 반드시 내용을 확인하세요.'

/**
 * PRD 3.5 생성 중 안내 문구
 */
export const GENERATING_STATUS_MESSAGE = 'SQL을 생성하고 있습니다.'

/**
 * PRD 3.7 복사 성공 피드백 문구
 */
export const COPY_SUCCESS_MESSAGE = '복사되었습니다.'

/**
 * PRD 3.4 & 3.7 버튼 고정 텍스트
 */
export const BUTTON_LABELS = {
  GENERATE: 'SQL 생성',
  COPY: '복사',
} as const

/**
 * 입력 제약조건 및 타임아웃 상수
 */
export const SYSTEM_LIMITS = {
  MIN_INPUT_LENGTH: 3,
  MAX_INPUT_LENGTH: 1000,
  API_TIMEOUT_MS: 10000, // PRD 5.5: 10초 타임아웃
  FEEDBACK_DURATION_MS: 2500, // 복사 성공 피드백 표시 시간
} as const

/**
 * PRD 3.8 / 5.10 위험 SQL 판별 대상 키워드
 */
export const DANGEROUS_SQL_KEYWORDS: DangerousKeyword[] = [
  'UPDATE',
  'DELETE',
  'DROP',
  'TRUNCATE',
  'ALTER',
]

/**
 * 타 DBMS 키워드 목록 (PRD E-09 감지용)
 */
export const NON_ORACLE_DBMS_KEYWORDS = [
  'mysql',
  'postgresql',
  'postgres',
  'mssql',
  'sql server',
  'sqlite',
  'mariadb',
  'mongodb',
  'redis',
]
