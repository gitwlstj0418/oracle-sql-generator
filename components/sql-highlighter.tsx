'use client'

import React from 'react'

interface SqlHighlighterProps {
  sql: string
}

// Oracle SQL 키워드 목록
const SQL_KEYWORDS = new Set([
  'SELECT',
  'FROM',
  'WHERE',
  'JOIN',
  'INNER',
  'LEFT',
  'RIGHT',
  'FULL',
  'OUTER',
  'CROSS',
  'ON',
  'GROUP',
  'BY',
  'ORDER',
  'HAVING',
  'INSERT',
  'INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE',
  'CREATE',
  'TABLE',
  'ALTER',
  'DROP',
  'TRUNCATE',
  'UNION',
  'ALL',
  'INTERSECT',
  'MINUS',
  'WITH',
  'AS',
  'AND',
  'OR',
  'NOT',
  'IN',
  'EXISTS',
  'BETWEEN',
  'LIKE',
  'IS',
  'NULL',
  'ASC',
  'DESC',
  'NULLS',
  'FIRST',
  'LAST',
  'FETCH',
  'ROWS',
  'ONLY',
  'ROWNUM',
  'PRIMARY',
  'KEY',
  'FOREIGN',
  'REFERENCES',
  'DEFAULT',
  'CONSTRAINT',
  'DISTINCT',
  'UNIQUE',
  'CHECK',
  'INDEX',
  'VIEW',
  'SEQUENCE',
  'NEXTVAL',
  'CURRVAL',
  'GRANT',
  'REVOKE',
  'COMMIT',
  'ROLLBACK',
])

// Oracle SQL 내장 함수 및 윈도우 키워드
const SQL_FUNCTIONS = new Set([
  'ROW_NUMBER',
  'RANK',
  'DENSE_RANK',
  'OVER',
  'PARTITION',
  'LISTAGG',
  'WITHIN',
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'NVL',
  'NVL2',
  'COALESCE',
  'NULLIF',
  'DECODE',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'SYSDATE',
  'CURRENT_TIMESTAMP',
  'SYSTIMESTAMP',
  'ADD_MONTHS',
  'MONTHS_BETWEEN',
  'LAST_DAY',
  'NEXT_DAY',
  'TRUNC',
  'ROUND',
  'TO_CHAR',
  'TO_DATE',
  'TO_NUMBER',
  'TO_TIMESTAMP',
  'SUBSTR',
  'INSTR',
  'LENGTH',
  'REPLACE',
  'UPPER',
  'LOWER',
  'INITCAP',
  'LPAD',
  'RPAD',
  'TRIM',
  'LTRIM',
  'RTRIM',
  'GREATEST',
  'LEAST',
  'ABS',
  'MOD',
  'FLOOR',
  'CEIL',
  'POWER',
  'SQRT',
  'EXTRACT',
])

// Oracle 데이터 타입
const SQL_TYPES = new Set([
  'NUMBER',
  'VARCHAR2',
  'VARCHAR',
  'CHAR',
  'NCHAR',
  'NVARCHAR2',
  'DATE',
  'TIMESTAMP',
  'CLOB',
  'NCLOB',
  'BLOB',
  'RAW',
  'LONG',
  'INTEGER',
  'INT',
  'SMALLINT',
  'FLOAT',
  'DECIMAL',
  'BOOLEAN',
])

// 위험 DML/DDL 키워드 (강조 색상용)
const DANGEROUS_KEYWORDS = new Set(['UPDATE', 'DELETE', 'DROP', 'TRUNCATE', 'ALTER'])

interface Token {
  type: 'keyword' | 'dangerous' | 'function' | 'type' | 'string' | 'number' | 'comment' | 'operator' | 'punctuation' | 'identifier' | 'whitespace'
  value: string
}

function tokenizeSql(sql: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const len = sql.length

  while (i < len) {
    const char = sql[i]

    // 1. 공백 및 줄바꿈
    if (/\s/.test(char)) {
      let ws = ''
      while (i < len && /\s/.test(sql[i])) {
        ws += sql[i]
        i++
      }
      tokens.push({ type: 'whitespace', value: ws })
      continue
    }

    // 2. 한 줄 주석 (-- ...)
    if (char === '-' && sql[i + 1] === '-') {
      let comment = ''
      while (i < len && sql[i] !== '\n') {
        comment += sql[i]
        i++
      }
      tokens.push({ type: 'comment', value: comment })
      continue
    }

    // 3. 다중 줄 주석 (/* ... */)
    if (char === '/' && sql[i + 1] === '*') {
      let comment = '/*'
      i += 2
      while (i < len && !(sql[i] === '*' && sql[i + 1] === '/')) {
        comment += sql[i]
        i++
      }
      if (i < len) {
        comment += '*/'
        i += 2
      }
      tokens.push({ type: 'comment', value: comment })
      continue
    }

    // 4. 문자열 리터럴 ('...')
    if (char === "'") {
      let str = "'"
      i++
      while (i < len) {
        if (sql[i] === "'") {
          str += "'"
          i++
          // 이스케이프된 작은따옴표 ('')
          if (sql[i] === "'") {
            str += "'"
            i++
          } else {
            break
          }
        } else {
          str += sql[i]
          i++
        }
      }
      tokens.push({ type: 'string', value: str })
      continue
    }

    // 5. 큰따옴표 식별자 ("...")
    if (char === '"') {
      let ident = '"'
      i++
      while (i < len && sql[i] !== '"') {
        ident += sql[i]
        i++
      }
      if (i < len) {
        ident += '"'
        i++
      }
      tokens.push({ type: 'identifier', value: ident })
      continue
    }

    // 6. 숫자 리터럴
    if (/\d/.test(char) || (char === '.' && /\d/.test(sql[i + 1] || ''))) {
      let num = ''
      while (i < len && /[\d.]/.test(sql[i])) {
        num += sql[i]
        i++
      }
      tokens.push({ type: 'number', value: num })
      continue
    }

    // 7. 단어 (키워드, 함수, 타입, 식별자)
    if (/[a-zA-Z가-힣_#$]/.test(char)) {
      let word = ''
      while (i < len && /[a-zA-Z0-9가-힣_#$]/.test(sql[i])) {
        word += sql[i]
        i++
      }
      const upper = word.toUpperCase()
      if (DANGEROUS_KEYWORDS.has(upper)) {
        tokens.push({ type: 'dangerous', value: word })
      } else if (SQL_KEYWORDS.has(upper)) {
        tokens.push({ type: 'keyword', value: word })
      } else if (SQL_FUNCTIONS.has(upper)) {
        tokens.push({ type: 'function', value: word })
      } else if (SQL_TYPES.has(upper)) {
        tokens.push({ type: 'type', value: word })
      } else {
        tokens.push({ type: 'identifier', value: word })
      }
      continue
    }

    // 8. 연산자 (||, !=, <>, <=, >=, := 등)
    if (char === '|' && sql[i + 1] === '|') {
      tokens.push({ type: 'operator', value: '||' })
      i += 2
      continue
    }
    if ((char === '!' || char === '<' || char === '>') && sql[i + 1] === '=') {
      tokens.push({ type: 'operator', value: char + '=' })
      i += 2
      continue
    }
    if (char === '<' && sql[i + 1] === '>') {
      tokens.push({ type: 'operator', value: '<>' })
      i += 2
      continue
    }
    if (char === ':' && sql[i + 1] === '=') {
      tokens.push({ type: 'operator', value: ':=' })
      i += 2
      continue
    }

    // 9. 단일 기호
    if ('=+-*/<>'.includes(char)) {
      tokens.push({ type: 'operator', value: char })
      i++
      continue
    }
    if ('(),;.:'.includes(char)) {
      tokens.push({ type: 'punctuation', value: char })
      i++
      continue
    }

    // 기타 문자
    tokens.push({ type: 'identifier', value: char })
    i++
  }

  return tokens
}

export function SqlHighlighter({ sql }: SqlHighlighterProps) {
  const tokens = React.useMemo(() => tokenizeSql(sql), [sql])
  const lines = sql.split('\n')

  return (
    <div className="grid grid-cols-[auto_1fr] font-mono text-sm leading-relaxed select-text">
      {/* 줄 번호 컬럼 */}
      <div
        className="select-none pr-4 text-right text-xs font-medium text-muted-foreground/50 border-r border-border/50 select-none"
        aria-hidden="true"
      >
        {lines.map((_, index) => (
          <div key={index} className="leading-relaxed">
            {index + 1}
          </div>
        ))}
      </div>

      {/* 구문 강조 코드 영역 */}
      <div className="pl-4 whitespace-pre overflow-x-auto">
        {tokens.map((token, index) => {
          switch (token.type) {
            case 'dangerous':
              return (
                <span
                  key={index}
                  className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded px-0.5"
                >
                  {token.value}
                </span>
              )
            case 'keyword':
              return (
                <span key={index} className="font-bold text-indigo-600 dark:text-indigo-400">
                  {token.value}
                </span>
              )
            case 'function':
              return (
                <span key={index} className="font-semibold text-sky-600 dark:text-sky-300">
                  {token.value}
                </span>
              )
            case 'type':
              return (
                <span key={index} className="text-teal-600 dark:text-teal-400">
                  {token.value}
                </span>
              )
            case 'string':
              return (
                <span key={index} className="text-emerald-600 dark:text-emerald-400">
                  {token.value}
                </span>
              )
            case 'number':
              return (
                <span key={index} className="text-orange-600 dark:text-orange-400">
                  {token.value}
                </span>
              )
            case 'comment':
              return (
                <span key={index} className="italic text-muted-foreground/70">
                  {token.value}
                </span>
              )
            case 'operator':
              return (
                <span key={index} className="font-medium text-purple-600 dark:text-purple-300">
                  {token.value}
                </span>
              )
            case 'punctuation':
              return (
                <span key={index} className="text-foreground/70">
                  {token.value}
                </span>
              )
            case 'whitespace':
              return <React.Fragment key={index}>{token.value}</React.Fragment>
            default:
              return (
                <span key={index} className="text-foreground">
                  {token.value}
                </span>
              )
          }
        })}
      </div>
    </div>
  )
}
