'use client'

import React, { useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Database, FileText, Sparkles, Trash2, Upload } from 'lucide-react'

interface SchemaInputProps {
  schema: string
  onChange: (value: string) => void
  disabled?: boolean
}

const SAMPLE_SCHEMAS = [
  {
    name: '사원/부서 (HR)',
    description: 'employees, departments',
    ddl: `-- [사원 테이블]
CREATE TABLE employees (
    emp_id NUMBER PRIMARY KEY,
    emp_name VARCHAR2(50) NOT NULL,
    dept_id NUMBER,
    salary NUMBER(10, 2),
    hire_date DATE DEFAULT SYSDATE
);

-- [부서 테이블]
CREATE TABLE departments (
    dept_id NUMBER PRIMARY KEY,
    dept_name VARCHAR2(100) NOT NULL,
    manager_id NUMBER,
    location VARCHAR2(100)
);`,
  },
  {
    name: '주문/상품 (E-Commerce)',
    description: 'customers, orders, products',
    ddl: `-- [고객 테이블]
CREATE TABLE customers (
    customer_id NUMBER PRIMARY KEY,
    customer_name VARCHAR2(50) NOT NULL,
    email VARCHAR2(100) UNIQUE,
    grade VARCHAR2(20) DEFAULT 'SILVER',
    created_at DATE DEFAULT SYSDATE
);

-- [주문 테이블]
CREATE TABLE orders (
    order_id NUMBER PRIMARY KEY,
    customer_id NUMBER REFERENCES customers(customer_id),
    order_date DATE DEFAULT SYSDATE,
    total_amount NUMBER(12, 2),
    status VARCHAR2(20) -- 'PENDING', 'PAID', 'CANCEL'
);

-- [상품 테이블]
CREATE TABLE products (
    product_id NUMBER PRIMARY KEY,
    product_name VARCHAR2(100) NOT NULL,
    category VARCHAR2(50),
    price NUMBER(10, 2),
    stock_quantity NUMBER DEFAULT 0
);`,
  },
  {
    name: '회원/게시글 (Community)',
    description: 'users, posts, comments',
    ddl: `-- [회원 테이블]
CREATE TABLE users (
    user_id NUMBER PRIMARY KEY,
    username VARCHAR2(50) NOT NULL,
    nickname VARCHAR2(50),
    email VARCHAR2(100),
    point NUMBER DEFAULT 0,
    created_at DATE DEFAULT SYSDATE
);

-- [게시글 테이블]
CREATE TABLE posts (
    post_id NUMBER PRIMARY KEY,
    user_id NUMBER REFERENCES users(user_id),
    title VARCHAR2(200) NOT NULL,
    content CLOB,
    view_count NUMBER DEFAULT 0,
    created_at DATE DEFAULT SYSDATE
);`,
  },
]

export function SchemaInput({ schema, onChange, disabled }: SchemaInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasSchema = schema.trim().length > 0

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        onChange(content)
        setIsOpen(true)
      }
    }
    reader.readAsText(file)
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card/60 overflow-hidden transition shadow-sm">
      {/* 아코디언 헤더 */}
      <div className="flex items-center justify-between p-3.5 sm:px-4 bg-muted/30">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 text-left text-sm font-semibold text-foreground hover:text-primary transition"
        >
          <Database className="size-4 text-primary" aria-hidden="true" />
          <span>테이블 스키마 정의 (선택 사항)</span>
          {hasSchema ? (
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              ● 스키마 적용 중 ({schema.trim().length}자)
            </span>
          ) : (
            <span className="text-xs font-normal text-muted-foreground">
              (입력 시 존재하지 않는 컬럼 생성 방지)
            </span>
          )}
        </button>

        <div className="flex items-center gap-1.5">
          {hasSchema && (
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={disabled}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
              title="스키마 비우기"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">초기화</span>
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".sql,.txt,.ddl"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition"
          >
            <Upload className="size-3.5 text-primary" aria-hidden="true" />
            <span>파일 업로드 (.sql)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground transition"
            aria-label={isOpen ? '스키마 접기' : '스키마 펼치기'}
          >
            {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
      </div>

      {/* 아코디언 본문 */}
      {isOpen && (
        <div className="p-4 border-t border-border space-y-3 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between">
            <label htmlFor="schema-textarea" className="text-xs font-medium text-muted-foreground">
              테이블 DDL(`CREATE TABLE ...`) 또는 컬럼 구조를 자유롭게 입력하세요:
            </label>
            <span className="text-[11px] text-muted-foreground">
              {schema.length}자
            </span>
          </div>

          <textarea
            id="schema-textarea"
            value={schema}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={`예시:\nemployees (emp_id, emp_name, dept_id, salary, hire_date)\ndepartments (dept_id, dept_name, manager_id)\n\n또는 표준 CREATE TABLE DDL 문을 붙여넣으세요.`}
            rows={5}
            className="w-full resize-y font-mono rounded-lg border border-input bg-background/80 px-3.5 py-2.5 text-xs leading-relaxed shadow-sm transition placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          {/* 원클릭 샘플 스키마 버튼들 */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Sparkles className="size-3 text-primary" /> 샘플 스키마:
            </span>
            {SAMPLE_SCHEMAS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(sample.ddl)}
                disabled={disabled}
                className="rounded-md border border-border bg-muted/40 px-2 py-1 text-[11px] font-medium text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
