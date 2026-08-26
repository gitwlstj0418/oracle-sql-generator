'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Check, Clipboard, Code2, Database, LoaderCircle, Play, RotateCcw, Sparkles, WandSparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PreviewState = 'empty' | 'entered' | 'loading' | 'select' | 'dangerous' | 'input-error' | 'generation-error' | 'timeout' | 'invalid-result' | 'copy-success' | 'copy-failure'

const examplePrompt = '최근 30일 동안 가입한 고객 중 서울에 거주하며 주문 금액이 10만원 이상인 고객을 찾아줘'
const selectSql = `SELECT
    c.customer_id,
    c.customer_name,
    c.email,
    SUM(o.order_amount) AS total_order_amount
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
WHERE c.created_at >= SYSDATE - 30
  AND c.address LIKE '%서울%'
GROUP BY c.customer_id, c.customer_name, c.email
HAVING SUM(o.order_amount) >= 100000
ORDER BY total_order_amount DESC;`
const dangerousSql = `DELETE FROM customers
WHERE created_at < ADD_MONTHS(SYSDATE, -36)
  AND status = 'INACTIVE';`

export default function Page() {
  const [prompt, setPrompt] = useState('')
  const [state, setState] = useState<PreviewState>('empty')
  const [copyLabel, setCopyLabel] = useState('SQL 복사')

  const sql = useMemo(() => state === 'dangerous' ? dangerousSql : selectSql, [state])
  const hasResult = ['select', 'dangerous', 'copy-success', 'copy-failure', 'invalid-result'].includes(state)
  const isLoading = state === 'loading'
  const isError = ['input-error', 'generation-error', 'timeout', 'invalid-result'].includes(state)

  useEffect(() => {
    if (!['copy-success', 'copy-failure'].includes(state)) return
    const timer = window.setTimeout(() => {
      setState('select')
      setCopyLabel('SQL 복사')
    }, 2400)
    return () => window.clearTimeout(timer)
  }, [state])

  function useExample() {
    setPrompt(examplePrompt)
    setState('entered')
  }

  function generate() {
    if (!prompt.trim()) {
      setState('input-error')
      return
    }
    if (prompt.toLowerCase().includes('delete') || prompt.toLowerCase().includes('삭제')) {
      setState('dangerous')
      return
    }
    setState('loading')
    window.setTimeout(() => setState('select'), 900)
  }

  async function copySql() {
    try {
      await navigator.clipboard.writeText(sql)
      setCopyLabel('복사되었습니다')
      setState('copy-success')
    } catch {
      setCopyLabel('복사 실패')
      setState('copy-failure')
    }
  }

  const statusText = state === 'input-error' ? '자연어 요청을 입력해 주세요.' : state === 'generation-error' ? 'SQL 생성 중 문제가 발생했습니다. 다시 시도해 주세요.' : state === 'timeout' ? '요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.' : ''

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm"><Database aria-hidden="true" /></div>
            <div><p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-primary">ORACLE TOOLKIT</p><p className="text-sm font-semibold">SQL Generator</p></div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><span className="size-2 rounded-full bg-emerald-500" /> Oracle SQL 19c compatible</div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-16 pt-12 lg:px-8 lg:pt-16">
        <section className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary"><Sparkles aria-hidden="true" className="size-3.5" /> 자연어로 SQL 만들기</div>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">복잡한 Oracle SQL,<br /><span className="text-primary">한 문장으로</span> 완성하세요.</h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground">원하는 데이터를 자연어로 설명하면, Oracle 데이터베이스에 바로 사용할 수 있는 SQL을 생성합니다.</p>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="panel flex flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5"><div><h2 className="font-semibold">무엇을 찾고 있나요?</h2><p className="mt-1 text-sm text-muted-foreground">데이터 조건이나 원하는 결과를 설명해 주세요.</p></div><WandSparkles className="mt-1 size-5 text-primary" aria-hidden="true" /></div>
            <div className="flex flex-1 flex-col gap-4 p-6">
              <label htmlFor="prompt" className="sr-only">SQL 요청</label>
              <textarea id="prompt" value={prompt} onChange={(event) => { setPrompt(event.target.value); if (state !== 'empty') setState('entered') }} placeholder="예: 지난달 매출이 가장 높은 상품 10개를 보여줘" className="min-h-44 w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm leading-6 shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10" />
              <button type="button" onClick={useExample} className="flex items-center gap-2 self-start text-xs font-medium text-muted-foreground transition hover:text-primary"><Play className="size-3.5" aria-hidden="true" /> 예시 문장 사용하기</button>
              {isError && <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"><X className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span>{statusText}</span></div>}
              <Button onClick={generate} disabled={isLoading} className="mt-auto h-11 w-full gap-2 font-semibold"><span>{isLoading ? 'SQL 생성 중...' : 'SQL 생성하기'}</span>{isLoading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Sparkles className="size-4" aria-hidden="true" />}</Button>
              <p className="text-center text-xs text-muted-foreground">생성된 SQL은 실행 전 반드시 검토해 주세요.</p>
            </div>
          </div>

          <div className="panel min-h-[430px] overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-5"><div><h2 className="font-semibold">생성된 SQL</h2><p className="mt-1 text-sm text-muted-foreground">Oracle SQL</p></div>{hasResult && <Button variant="outline" size="sm" onClick={copySql} className="gap-2"><Clipboard className="size-3.5" aria-hidden="true" />{copyLabel}</Button>}</div>
            {!hasResult ? <div className="grid min-h-[345px] place-items-center px-8 text-center"><div><div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground"><Code2 className="size-6" aria-hidden="true" /></div><p className="font-medium">아직 생성된 SQL이 없습니다.</p><p className="mt-2 text-sm leading-6 text-muted-foreground">왼쪽 입력창에 요청을 작성하고<br />SQL 생성하기를 눌러보세요.</p></div></div> : <div className="flex min-h-[345px] flex-col"><div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-3"><span className="font-mono text-xs text-muted-foreground">query.sql</span><span className="font-mono text-[11px] text-muted-foreground">{state === 'dangerous' ? 'DML' : 'SELECT'}</span></div><pre className="code-scroll flex-1 overflow-auto bg-[color:var(--code-bg)] p-6 font-mono text-xs leading-6 text-[color:var(--code-text)]"><code>{sql}</code></pre>{state === 'dangerous' && <div role="alert" className="flex gap-3 border-t border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-900"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><div><p className="font-semibold">주의가 필요한 쿼리입니다</p><p className="mt-1 text-xs leading-5">데이터를 삭제하거나 변경하는 쿼리입니다. 실행 전 대상과 조건을 반드시 확인하세요.</p></div></div>}</div>}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-xs text-muted-foreground"><span>Powered by Oracle SQL patterns</span><span className="flex items-center gap-2"><span className="font-mono">PREVIEW</span><select aria-label="Preview state" value={state} onChange={(event) => setState(event.target.value as PreviewState)} className="rounded-md border border-input bg-background px-2 py-1 font-mono text-[11px] outline-none focus:ring-2 focus:ring-primary/20"><option value="empty">empty</option><option value="entered">entered</option><option value="loading">loading</option><option value="select">SELECT result</option><option value="dangerous">dangerous SQL</option><option value="input-error">input error</option><option value="generation-error">generation error</option><option value="timeout">timeout</option><option value="invalid-result">invalid result</option><option value="copy-success">copy success</option><option value="copy-failure">copy failure</option></select><button type="button" onClick={() => { setPrompt(''); setState('empty') }} aria-label="Reset preview" className="rounded p-1 hover:bg-muted"><RotateCcw className="size-3.5" /></button></span></div>
      </div>
    </main>
  )
}
