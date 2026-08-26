import { AlertTriangle } from 'lucide-react'
import { DANGEROUS_SQL_WARNING } from '@/lib/constants'

interface DangerAlertProps {
  message?: string | null
  className?: string
}

export function DangerAlert({ message = DANGEROUS_SQL_WARNING, className = '' }: DangerAlertProps) {
  if (!message) return null

  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 shadow-sm dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300 ${className}`}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
      <div className="flex-1 leading-snug">
        <span>{message}</span>
      </div>
    </div>
  )
}
