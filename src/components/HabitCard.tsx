import type { Habit } from '../domain/types'
import { automaticityLabel } from '../engine/automaticity'
import { useProfileBehaviour } from '../store/AppStoreContext'
import { isCompletedToday, formatIfThen } from '../domain/types'

type HabitCardProps = {
  habit: Habit
  onComplete: (tiny: boolean) => void
  onSkipToday?: () => void
  showRecovery?: boolean
  onDismissRecovery?: () => void
}

export function HabitCard({
  habit,
  onComplete,
  onSkipToday,
  showRecovery,
  onDismissRecovery,
}: HabitCardProps) {
  const behaviour = useProfileBehaviour()
  const completed = isCompletedToday(habit)
  const touchClass = behaviour.activation.veryLowThreshold ? 'size-12' : 'size-10'

  return (
    <div className="ha-card rounded-xl border border-border bg-surface-raised shadow-sm">
      {showRecovery && (
        <div className="mb-3 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-sm text-text">
          Ready to resume? Your automaticity is still at {habit.automaticityScore}% — not reset.
          {onDismissRecovery && (
            <button
              type="button"
              onClick={onDismissRecovery}
              className="ml-2 font-medium text-accent hover:underline"
            >
              Resume
            </button>
          )}
        </div>
      )}

      {habit.pendingChange && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Change coming {habit.pendingChange.effectiveDate}: {habit.pendingChange.message}
        </div>
      )}

      <div className="flex items-start gap-4">
        <button
          type="button"
          disabled={completed}
          onClick={() => onComplete(false)}
          aria-label={`Complete: ${habit.behaviour}`}
          className={`flex ${touchClass} shrink-0 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-80 ${
            completed
              ? 'border-transparent bg-accent text-white'
              : 'border-border bg-white hover:border-accent'
          }`}
        >
          {completed && (
            <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {automaticityLabel(habit.automaticityScore)} · {habit.automaticityScore}%
          </p>
          <p className="mt-1 text-sm text-text-muted">{formatIfThen(habit)}</p>
          {habit.valuesTag && (
            <p className="mt-1 text-xs text-accent">Linked to: {habit.valuesTag}</p>
          )}
          {habit.leavingBehind && (
            <p className="mt-1 text-xs text-text-muted">
              Moving away from: {habit.leavingBehind}
            </p>
          )}

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${habit.automaticityScore}%` }}
            />
          </div>

          {behaviour.activation.tinyVersionAlwaysVisible && !completed && (
            <button
              type="button"
              onClick={() => onComplete(true)}
              className="mt-3 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:border-accent hover:text-accent"
            >
              Tiny version: {habit.tinyVersion}
            </button>
          )}
        </div>
      </div>

      {!completed && onSkipToday && (
        <div className="mt-3 flex justify-end border-t border-border pt-3">
          <button
            type="button"
            onClick={onSkipToday}
            className="text-sm text-text-muted hover:text-text"
          >
            Not today
          </button>
        </div>
      )}
    </div>
  )
}
