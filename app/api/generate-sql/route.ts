import { NextRequest, NextResponse } from 'next/server'
import { generateOracleSql } from '@/lib/ai-provider'
import { DANGEROUS_SQL_WARNING, ERROR_MESSAGES, SYSTEM_LIMITS } from '@/lib/constants'
import { analyzeSqlSafety } from '@/lib/sql-analyzer'
import { GenerateSqlRequest, GenerateSqlResponse, SqlErrorCode } from '@/lib/types'

export async function POST(request: NextRequest) {
  let body: GenerateSqlRequest

  try {
    body = await request.json()
  } catch {
    return NextResponse.json<GenerateSqlResponse>(
      {
        success: false,
        errorCode: 'E-01',
        errorMessage: ERROR_MESSAGES['E-01'],
      },
      { status: 400 }
    )
  }

  const { prompt, requestId } = body
  const trimmed = (prompt || '').trim()

  // 1. 입력값 없음 검증 (PRD 5.1 / E-01)
  if (!trimmed) {
    return NextResponse.json<GenerateSqlResponse>(
      {
        success: false,
        errorCode: 'E-01',
        errorMessage: ERROR_MESSAGES['E-01'],
        requestId,
      },
      { status: 200 }
    )
  }

  // 2. 입력값 너무 짧음 검증 (PRD 5.2 / E-02)
  if (trimmed.length < SYSTEM_LIMITS.MIN_INPUT_LENGTH) {
    return NextResponse.json<GenerateSqlResponse>(
      {
        success: false,
        errorCode: 'E-02',
        errorMessage: ERROR_MESSAGES['E-02'],
        requestId,
      },
      { status: 200 }
    )
  }

  // 3. 입력값 너무 김 검증 (PRD 5.3 / E-03)
  if (trimmed.length > SYSTEM_LIMITS.MAX_INPUT_LENGTH) {
    return NextResponse.json<GenerateSqlResponse>(
      {
        success: false,
        errorCode: 'E-03',
        errorMessage: ERROR_MESSAGES['E-03'],
        requestId,
      },
      { status: 200 }
    )
  }

  // 4. 10초 타임아웃 제어 (PRD 5.5 / E-05)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), SYSTEM_LIMITS.API_TIMEOUT_MS)

  try {
    const result = await generateOracleSql(trimmed, controller.signal)
    clearTimeout(timeoutId)

    if (result.errorCode) {
      const code = result.errorCode as SqlErrorCode
      return NextResponse.json<GenerateSqlResponse>(
        {
          success: false,
          errorCode: code,
          errorMessage: ERROR_MESSAGES[code],
          requestId,
        },
        { status: 200 }
      )
    }

    if (!result.sql) {
      return NextResponse.json<GenerateSqlResponse>(
        {
          success: false,
          errorCode: 'E-04',
          errorMessage: ERROR_MESSAGES['E-04'],
          requestId,
        },
        { status: 200 }
      )
    }

    // 5. 위험 SQL 분석 (PRD 3.8 / 5.10 / E-10)
    const safety = analyzeSqlSafety(result.sql)

    return NextResponse.json<GenerateSqlResponse>(
      {
        success: true,
        sql: result.sql,
        isDangerous: safety.isDangerous,
        dangerousKeywords: safety.dangerousKeywords,
        warningMessage: safety.isDangerous ? DANGEROUS_SQL_WARNING : undefined,
        requestId,
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    clearTimeout(timeoutId)

    if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
      return NextResponse.json<GenerateSqlResponse>(
        {
          success: false,
          errorCode: 'E-05',
          errorMessage: ERROR_MESSAGES['E-05'],
          requestId,
        },
        { status: 200 }
      )
    }

    console.error('SQL Generation Server Error:', error)
    return NextResponse.json<GenerateSqlResponse>(
      {
        success: false,
        errorCode: 'E-04',
        errorMessage: ERROR_MESSAGES['E-04'],
        requestId,
      },
      { status: 200 }
    )
  }
}
