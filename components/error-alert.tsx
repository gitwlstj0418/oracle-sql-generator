import { AlertCircle } from 'lucide-react'

interface ErrorAlertProps {
  message: string | null
  className?: string
}

export function ErrorAlert({ message, className = '' }: ErrorAlertProps) {
  if (!message) return null

  return (
    <div
      role="alert"
      className={`flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/80 px-3.5 py-2.5 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 ${className}`}
    >
      <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}
