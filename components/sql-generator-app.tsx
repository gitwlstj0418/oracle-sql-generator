'use client'

import { Check, Clipboard, LoaderCircle, Sparkles, Terminal } from 'lucide-react'
import { DangerAlert } from '@/components/danger-alert'
import { ErrorAlert } from '@/components/error-alert'
import { SchemaInput } from '@/components/schema-input'
import { SqlViewer } from '@/components/sql-viewer'
import { Button } from '@/components/ui/button'
import { useSqlGenerator } from '@/hooks/use-sql-generator'

const EXAMPLE_PROMPTS = [
  '회원 테이블에서 최근 가입한 10명을 조회해줘',
  'orders 테이블에서 status가 CANCEL인 데이터를 삭제해줘',
  'users 테이블의 user_id가 100인 데이터의 이름을 홍길동으로 수정해줘',
  '지난달 매출이 가장 높은 상품 5개를 보여줘',
]

export default function SqlGeneratorApp() {
  const { state, setPrompt, setSchema, generateSql, copySqlToClipboard, labels } = useSqlGenerator()

  const isLoading = state.status === 'loading'
  const hasSqlResult = Boolean(state.sql)

  // 엔터키(Ctrl+Enter / Cmd+Enter)로 생성 실행
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      generateSql()
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 text-foreground py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* ========================================================================= */}
        {/* [순서 1] 서비스 제목 & [순서 2] 안내 문구 */}
        {/* ========================================================================= */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-3">
            <Terminal className="size-3.5" aria-hidden="true" />
            <span>Oracle 19c / 21c Compatible</span>
          </div>
          {/* 순서 1: 서비스 제목 */}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            Oracle 자연어 → SQL 생성기
          </h1>
          {/* 순서 2: 안내 문구 */}
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            수행하고 싶은 DB 작업을 자연어로 입력하면 즉시 사용할 수 있는 표준 Oracle SQL 1개를 생성합니다.
          </p>
        </header>

        {/* 단일 카드 레이아웃 */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          {/* 테이블 스키마 입력/업로드 영역 (환각 방지) */}
          <SchemaInput
            schema={state.schema}
            onChange={setSchema}
            disabled={isLoading}
          />

          {/* ========================================================================= */}
          {/* [순서 3] 자연어 입력창 */}
          {/* ========================================================================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="prompt-input" className="text-sm font-semibold text-foreground">
                원하는 DB 작업 요청
              </label>
              <span className="text-xs text-muted-foreground">
                {state.prompt.length} / 1,000자 (Ctrl + Enter로 생성)
              </span>
            </div>
            <textarea
              id="prompt-input"
              value={state.prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="예: orders 테이블에서 status가 CANCEL인 데이터를 삭제해줘"
              rows={4}
              className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm leading-relaxed shadow-sm transition placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              disabled={isLoading}
            />

            {/* 빠른 예시 선택 칩 */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-muted-foreground mr-1">예시:</span>
              {EXAMPLE_PROMPTS.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPrompt(example)}
                  className="rounded-md border border-border bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  {example.length > 25 ? example.substring(0, 25) + '...' : example}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* [순서 4] 입력 오류 문구 영역 (빨간색 텍스트) */}
          {/* ========================================================================= */}
          {state.inputError && <ErrorAlert message={state.inputError} />}

          {/* ========================================================================= */}
          {/* [순서 5] SQL 생성 버튼 */}
          {/* ========================================================================= */}
          <div>
            <Button
              type="button"
              onClick={generateSql}
              disabled={isLoading}
              className="h-11 w-full gap-2 rounded-xl text-base font-semibold shadow-sm transition active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  <span>{labels.generateButton}</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4" aria-hidden="true" />
                  <span>{labels.generateButton}</span>
                </>
              )}
            </Button>
          </div>

          {/* ========================================================================= */}
          {/* [순서 6] 생성 상태 영역 */}
          {/* ========================================================================= */}
          {isLoading && (
            <div
              role="status"
              className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 py-3 text-sm font-medium text-primary animate-pulse"
            >
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              <span>{labels.generatingStatus}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* [순서 7] 결과 오류 문구 영역 (빨간색 텍스트) */}
          {/* ========================================================================= */}
          {state.resultError && <ErrorAlert message={state.resultError} />}

          {/* ========================================================================= */}
          {/* [순서 8] 위험 SQL 경고 영역 */}
          {/* ========================================================================= */}
          {state.isDangerous && <DangerAlert message={state.warningMessage} />}

          {/* ========================================================================= */}
          {/* [순서 9] SQL 결과 영역 */}
          {/* ========================================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">생성 결과</h2>
              {hasSqlResult && (
                <span className="text-xs text-muted-foreground">단일 Oracle 쿼리 1건</span>
              )}
            </div>
            <SqlViewer sql={state.sql} isDangerous={state.isDangerous} />
          </div>

          {/* ========================================================================= */}
          {/* [순서 10] 복사 버튼 & 복사 피드백/오류 영역 */}
          {/* ========================================================================= */}
          {hasSqlResult && (
            <div className="space-y-2 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={copySqlToClipboard}
                className="h-11 w-full gap-2 rounded-xl text-sm font-semibold border-primary/30 hover:bg-primary/5 hover:border-primary/60 transition"
              >
                {state.copyFeedback ? (
                  <>
                    <Check className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <span className="text-emerald-600 dark:text-emerald-400">{state.copyFeedback}</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="size-4 text-primary" aria-hidden="true" />
                    <span>{labels.copyButton}</span>
                  </>
                )}
              </Button>

              {/* 복사 실패 에러 (PRD E-12) */}
              {state.copyError && <ErrorAlert message={state.copyError} />}
            </div>
          )}
        </div>

        {/* 푸터 안내 */}
        <footer className="mt-8 text-center text-xs text-muted-foreground">
          <p>※ 생성된 SQL은 화면에만 표시되며 실제 DB에서 실행되지 않습니다. 실행 전 반드시 내용을 검토하세요.</p>
        </footer>
      </div>
    </main>
  )
}
