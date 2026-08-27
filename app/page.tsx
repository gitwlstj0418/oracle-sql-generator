import Link from 'next/link'
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  Code2,
  Database,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: MessageSquareText,
    title: '원하는 작업 입력',
    description: '복잡한 문법 대신 필요한 데이터와 조건을 평소 사용하는 말로 설명하세요.',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'Oracle SQL 생성',
    description: '요청 의도를 분석해 Oracle 19c·21c 문법에 맞는 SQL 한 건으로 변환합니다.',
  },
  {
    number: '03',
    icon: ClipboardCheck,
    title: '검토하고 바로 복사',
    description: '위험 쿼리 경고와 구문 강조를 확인한 뒤 원하는 데이터베이스 도구로 복사하세요.',
  },
]

const assurances = [
  '로그인 없이 바로 사용',
  'Oracle 19c·21c 문법 지원',
  '실제 DB 연결 및 실행 없음',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-[var(--outline-variant)] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 lg:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
            aria-label="SQLForge 홈"
          >
            <span className="grid size-9 place-items-center rounded bg-primary text-primary-foreground">
              <Database className="size-5" aria-hidden="true" />
            </span>
            <span className="flex items-baseline gap-2">
              <span className="text-lg font-bold tracking-[-0.02em] text-[var(--secondary-ink)]">SQLForge</span>
              <span className="hidden text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:inline">
                Oracle SQL Generator
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-2" aria-label="주요 메뉴">
            <a
              href="#workflow"
              className="hidden h-10 items-center px-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              사용 방법
            </a>
            <Link
              href="/generator"
              className="inline-flex h-10 items-center justify-center gap-2 rounded bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-[var(--primary-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              SQL 생성기 열기
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-[var(--outline-variant)] bg-background">
          <div className="pointer-events-none absolute inset-0 landing-grid opacity-60" aria-hidden="true" />
          <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-5 py-16 md:py-24 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-10 lg:py-28">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 border border-[var(--outline-variant)] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-primary">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                Built for Oracle 19c / 21c
              </div>

              <h1 className="text-[2.5rem] font-bold leading-[1.12] tracking-[-0.035em] text-[var(--secondary-ink)] sm:text-5xl lg:text-[3.5rem]">
                자연어를 Oracle SQL로,
                <span className="mt-2 block text-primary">가장 빠른 쿼리 작성</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                복잡한 문법을 다시 찾을 필요 없이 원하는 데이터 작업을 설명하세요. SQLForge가
                실행 전 검토하기 쉬운 Oracle SQL로 정리합니다.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/generator"
                  className="inline-flex h-12 min-w-52 items-center justify-center gap-2 rounded bg-primary px-6 text-base font-bold text-primary-foreground shadow-[0_1px_3px_rgba(0,0,0,0.16)] transition-colors hover:bg-[var(--primary-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  무료로 SQL 생성하기
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <span className="inline-flex h-12 items-center justify-center gap-2 px-3 text-sm font-medium text-muted-foreground sm:justify-start">
                  <ShieldCheck className="size-4 text-[var(--success)]" aria-hidden="true" />
                  회원가입과 DB 연결이 필요 없습니다
                </span>
              </div>

              <ul className="mt-8 grid gap-2 text-sm text-[var(--secondary-ink)] sm:grid-cols-3">
                {assurances.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
                      <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mx-auto w-full max-w-2xl lg:mx-0">
              <div className="absolute -inset-5 translate-x-4 translate-y-4 border border-[var(--outline-variant)] bg-[var(--primary-soft)]" aria-hidden="true" />
              <div className="relative border border-[var(--code-border)] bg-[var(--code-bg)] shadow-[0_16px_40px_rgba(26,28,30,0.16)]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div className="flex items-center gap-2" aria-hidden="true">
                    <span className="size-2 rounded-full bg-primary" />
                    <span className="size-2 rounded-full bg-amber-400" />
                    <span className="size-2 rounded-full bg-[var(--success)]" />
                  </div>
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-white/50">
                    Oracle SQL · Preview
                  </span>
                </div>

                <div className="border-b border-white/10 bg-white/[0.03] px-5 py-5">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/45">
                    Natural language request
                  </p>
                  <p className="text-sm leading-6 text-white/90">지난달 매출이 가장 높은 상품 5개를 보여줘</p>
                </div>

                <div className="grid grid-cols-[42px_1fr] px-0 py-5 font-mono text-[13px] leading-6 sm:text-sm">
                  <div className="select-none border-r border-white/10 pr-3 text-right text-white/25" aria-hidden="true">
                    <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div>
                  </div>
                  <pre className="overflow-x-auto pl-4 pr-5 text-[var(--code-text)]"><code><span className="text-[var(--code-keyword)]">SELECT</span>{'\n'}    product_id,{'\n'}    <span className="text-sky-300">SUM</span>(sales_amount) <span className="text-[var(--code-keyword)]">AS</span> total_sales{'\n'}<span className="text-[var(--code-keyword)]">FROM</span> sales{'\n'}<span className="text-[var(--code-keyword)]">GROUP BY</span> product_id{'\n'}<span className="text-[var(--code-keyword)]">ORDER BY</span> total_sales DESC{'\n'}<span className="text-[var(--code-keyword)]">FETCH FIRST</span> <span className="text-amber-300">5</span> <span className="text-[var(--code-keyword)]">ROWS ONLY</span>;</code></pre>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.03] px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-white/55">
                    <Code2 className="size-3.5" aria-hidden="true" /> 단일 쿼리 생성 완료
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--success-bright)]">
                    <Check className="size-3.5" aria-hidden="true" /> Oracle 문법
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="scroll-mt-20 bg-white py-16 md:py-24">
          <div className="mx-auto w-full max-w-7xl px-5 lg:px-10">
            <div className="mb-10 max-w-2xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-primary">Simple workflow</p>
              <h2 className="text-3xl font-bold tracking-[-0.025em] text-[var(--secondary-ink)] sm:text-4xl">
                설명하고, 생성하고, 바로 사용하세요
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                SQLForge는 불필요한 설정과 화면 이동 없이 세 단계로 필요한 SQL을 제공합니다.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon
                return (
                  <article key={step.number} className="group relative min-h-64 border border-[var(--outline-variant)] bg-background p-6 transition-colors hover:border-primary/40 hover:bg-[var(--primary-soft)]">
                    <div className="flex items-start justify-between">
                      <span className="grid size-11 place-items-center rounded bg-primary text-primary-foreground">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-sm font-bold text-[var(--outline-strong)]">STEP {step.number}</span>
                    </div>
                    <h3 className="mt-10 text-xl font-bold text-[var(--secondary-ink)]">{step.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.description}</p>
                    <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-primary transition-transform group-hover:scale-x-100" />
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--outline-variant)] bg-[var(--surface-blue)] py-16 md:py-20">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-primary">Built for review</p>
              <h2 className="text-3xl font-bold tracking-[-0.025em] text-[var(--secondary-ink)]">실행 전에 판단할 수 있는 결과</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                생성된 SQL을 실제 데이터베이스에서 실행하지 않습니다. 위험 가능성이 있는 명령은 별도로 표시하고, 사용자가 검토한 결과만 복사할 수 있습니다.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['01', '위험 SQL 경고', 'UPDATE·DELETE·DDL을 명확히 표시'],
                ['02', '구문 강조', '키워드와 값의 구조를 빠르게 파악'],
                ['03', '스키마 참고', '테이블 구조를 요청과 함께 전달'],
              ].map(([number, title, description]) => (
                <div key={number} className="border-l-2 border-primary bg-white p-5">
                  <span className="font-mono text-xs font-bold text-primary">{number}</span>
                  <h3 className="mt-4 font-bold text-[var(--secondary-ink)]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--secondary-ink)] px-5 py-16 text-center text-white md:py-20 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <span className="mx-auto grid size-12 place-items-center rounded bg-primary text-primary-foreground">
              <Zap className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-6 text-3xl font-bold tracking-[-0.025em] sm:text-4xl">필요한 Oracle SQL을 지금 만들어보세요</h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/65">
              설치도, 로그인도 필요 없습니다. 자연어 요청 한 줄로 바로 시작할 수 있습니다.
            </p>
            <Link href="/generator" className="mt-8 inline-flex h-12 min-w-56 items-center justify-center gap-2 rounded bg-primary px-6 text-base font-bold text-primary-foreground transition-colors hover:bg-[var(--primary-light)] hover:text-[var(--secondary-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--secondary-ink)]">
              SQL 생성기 시작하기
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--outline-variant)] bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div className="flex items-center gap-2 font-bold text-[var(--secondary-ink)]">
            <Database className="size-4 text-primary" aria-hidden="true" /> SQLForge
          </div>
          <p>Oracle Engine 19c / 21c compatible · 생성 결과는 실행 전 반드시 검토하세요.</p>
        </div>
      </footer>
    </div>
  )
}
