import { SAFETY_PRIVACY_NOTE } from '../safety/messages'

type SafetyBlockNoticeProps = {
  message: string
  className?: string
}

export function SafetyBlockNotice({ message, className = '' }: SafetyBlockNoticeProps) {
  return (
    <div
      role="alert"
      className={`rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 ${className}`}
    >
      <p>{message}</p>
      <p className="mt-2 text-xs text-red-800/90">{SAFETY_PRIVACY_NOTE}</p>
    </div>
  )
}
