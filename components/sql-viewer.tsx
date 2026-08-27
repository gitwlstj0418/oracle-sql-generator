import { Code2, Database } from 'lucide-react'
import { SqlHighlighter } from './sql-highlighter'

interface SqlViewerProps {
  sql: string | null
  isDangerous?: boolean
}

export function SqlViewer({ sql, isDangerous }: SqlViewerProps) {
  if (!sql) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-8 text-center">
        <div className="mb-3 grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground shadow-sm">
          <Code2 className="size-6" aria-hidden="true" />
        </div>
        <p className="font-medium text-foreground">생성된 SQL이 여기에 표시됩니다.</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          원하는 데이터베이스 작업을 자연어로 입력하고 <strong>SQL 생성</strong> 버튼을 눌러주세요.
        </p>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* 쿼리 뷰어 상단 헤더 */}
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Database className="size-3.5 text-primary" aria-hidden="true" />
          <span className="font-mono text-xs font-semibold text-foreground">Oracle SQL (19c/21c)</span>
        </div>
        <div className="flex items-center gap-2">
          {isDangerous && (
            <span className="rounded bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              DML / DDL (위험)
            </span>
          )}
          <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            Syntax Highlighted
          </span>
        </div>
      </div>

      {/* SQL 코드 본문 (구문 강조 적용, 읽기 전용, 순수 텍스트 선택 가능) */}
      <div className="overflow-x-auto p-5 bg-card/50">
        <SqlHighlighter sql={sql} />
      </div>
    </div>
  )
}
