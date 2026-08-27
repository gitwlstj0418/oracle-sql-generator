import type { Metadata } from 'next'
import SqlGeneratorApp from '@/components/sql-generator-app'

export const metadata: Metadata = {
  title: 'SQL 생성기 | SQLForge',
  description: '자연어 요청을 Oracle 19c/21c SQL로 변환하고 바로 복사하세요.',
}

export default function GeneratorPage() {
  return <SqlGeneratorApp />
}
