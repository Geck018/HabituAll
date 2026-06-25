import { HABIT_PRIVACY_NOTICE } from '../privacy/habitCrypto'
import { SAFETY_PRIVACY_NOTE } from '../safety/messages'

type HabitPrivacyNoticeProps = {
  compact?: boolean
}

export function HabitPrivacyNotice({ compact }: HabitPrivacyNoticeProps) {
  return (
    <div
      className={`rounded-xl border border-accent/25 bg-accent/5 ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        Private & encrypted
      </p>
      <p className={`mt-2 text-text-muted ${compact ? 'text-xs' : 'text-sm'}`}>
        {HABIT_PRIVACY_NOTICE}
      </p>
      <p className={`mt-2 text-text-muted ${compact ? 'text-xs' : 'text-sm'}`}>
        {SAFETY_PRIVACY_NOTE} Harmful wording is blocked on new behaviours you&apos;re building —
        not on &quot;what I&apos;m moving away from,&quot; so you can name habits you&apos;re trying to quit.
      </p>
    </div>
  )
}
