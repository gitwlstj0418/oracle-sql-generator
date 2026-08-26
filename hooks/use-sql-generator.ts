'use client'

import { useCallback, useRef, useState } from 'react'
import {
  BUTTON_LABELS,
  COPY_SUCCESS_MESSAGE,
  DANGEROUS_SQL_WARNING,
  ERROR_MESSAGES,
  GENERATING_STATUS_MESSAGE,
  SYSTEM_LIMITS,
} from '@/lib/constants'
import { GenerateSqlResponse, GeneratorState, SqlErrorCode } from '@/lib/types'

const initialState: GeneratorState = {
  prompt: '',
  status: 'idle',
  sql: null,
  isDangerous: false,
  warningMessage: null,
  inputError: null,
  resultError: null,
  copyFeedback: null,
  copyError: null,
  activeRequestId: null,
}

export function useSqlGenerator() {
  const [state, setState] = useState<GeneratorState>(initialState)
  const currentAbortController = useRef<AbortController | null>(null)
  const requestCounter = useRef(0)
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 1. 입력 변경 핸들러 (PRD 5.14: 입력값 수정 시 입력 오류 제거 및 기존 SQL 초기화)
  const setPrompt = useCallback((value: string) => {
    setState((prev) => ({
      ...prev,
      prompt: value,
      inputError: null,
      resultError: null,
      sql: null,
      isDangerous: false,
      warningMessage: null,
      status: prev.status === 'loading' ? 'loading' : 'idle',
    }))
  }, [])

  // 2. 클라이언트 사전 검증 (PRD 4.2 / F-02 & PRD 5.1~5.3)
  const validateInput = useCallback((text: string): SqlErrorCode | null => {
    const trimmed = text.trim()
    if (!trimmed) {
      return 'E-01'
    }
    if (trimmed.length < SYSTEM_LIMITS.MIN_INPUT_LENGTH) {
      return 'E-02'
    }
    if (trimmed.length > SYSTEM_LIMITS.MAX_INPUT_LENGTH) {
      return 'E-03'
    }
    return null
  }, [])

  // 3. SQL 생성 요청 핸들러 (PRD 3.4 / 3.5 / 5.5 / 5.14)
  const generateSql = useCallback(async () => {
    if (state.status === 'loading') return

    // 클라이언트 입력 검증
    const validationError = validateInput(state.prompt)
    if (validationError) {
      setState((prev) => ({
        ...prev,
        inputError: ERROR_MESSAGES[validationError],
        resultError: null,
        sql: null,
        isDangerous: false,
        warningMessage: null,
        status: 'error',
      }))
      return
    }

    // 이전 요청 취소 및 새 시퀀스 ID 발급 (레이스 컨디션 방지, PRD 5.5)
    if (currentAbortController.current) {
      currentAbortController.current.abort()
    }
    const controller = new AbortController()
    currentAbortController.current = controller
    const requestId = `req_${++requestCounter.current}`

    // 생성 중 상태로 전환 (이전 오류 및 결과 제거)
    setState((prev) => ({
      ...prev,
      status: 'loading',
      inputError: null,
      resultError: null,
      copyFeedback: null,
      copyError: null,
      activeRequestId: requestId,
    }))

    // 클라이언트 사이드 10초 타임아웃 타이머
    const timeoutTimer = setTimeout(() => {
      if (currentAbortController.current === controller) {
        controller.abort()
      }
    }, SYSTEM_LIMITS.API_TIMEOUT_MS)

    try {
      const response = await fetch('/api/generate-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: state.prompt.trim(), requestId }),
        signal: controller.signal,
      })

      clearTimeout(timeoutTimer)

      // 이전 요청의 응답이면 무시 (PRD 5.5)
      if (requestCounter.current !== parseInt(requestId.replace('req_', ''), 10)) {
        return
      }

      const data: GenerateSqlResponse = await response.json()

      if (data.success && data.sql) {
        // 성공: 모든 오류 제거 및 새 결과 노출
        setState((prev) => ({
          ...prev,
          status: 'success',
          sql: data.sql!,
          isDangerous: Boolean(data.isDangerous),
          warningMessage: data.isDangerous ? (data.warningMessage || DANGEROUS_SQL_WARNING) : null,
          inputError: null,
          resultError: null,
        }))
      } else {
        // 실패: 에러 메시지 노출 및 결과 초기화
        const errCode = data.errorCode || 'E-04'
        setState((prev) => ({
          ...prev,
          status: 'error',
          sql: null,
          isDangerous: false,
          warningMessage: null,
          resultError: data.errorMessage || ERROR_MESSAGES[errCode],
          inputError: null,
        }))
      }
    } catch (error: unknown) {
      clearTimeout(timeoutTimer)

      // 최신 요청이 아닌 경우 무시
      if (requestCounter.current !== parseInt(requestId.replace('req_', ''), 10)) {
        return
      }

      const isAborted = controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')

      setState((prev) => ({
        ...prev,
        status: 'error',
        sql: null,
        isDangerous: false,
        warningMessage: null,
        resultError: isAborted ? ERROR_MESSAGES['E-05'] : ERROR_MESSAGES['E-04'],
        inputError: null,
      }))
    }
  }, [state.prompt, state.status, validateInput])

  // 4. 클립보드 복사 핸들러 (PRD 3.7 / 5.11 / 5.12)
  const copySqlToClipboard = useCallback(async () => {
    if (!state.sql) return

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(state.sql)
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea')
        textArea.value = state.sql
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textArea)
        if (!success) throw new Error('execCommand copy failed')
      }

      // 복사 성공 피드백 표시
      setState((prev) => ({
        ...prev,
        copyFeedback: COPY_SUCCESS_MESSAGE,
        copyError: null,
      }))

      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current)
      }
      feedbackTimerRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, copyFeedback: null }))
      }, SYSTEM_LIMITS.FEEDBACK_DURATION_MS)
    } catch {
      // 복사 실패 처리 (PRD E-12)
      setState((prev) => ({
        ...prev,
        copyError: ERROR_MESSAGES['E-12'],
        copyFeedback: null,
      }))
    }
  }, [state.sql])

  return {
    state,
    setPrompt,
    generateSql,
    copySqlToClipboard,
    labels: {
      generateButton: BUTTON_LABELS.GENERATE,
      copyButton: BUTTON_LABELS.COPY,
      generatingStatus: GENERATING_STATUS_MESSAGE,
    },
  }
}
