import { formatIfThen, type Habit, type Page } from '../domain/types'
import { automaticityLabel } from '../engine/automaticity'
import { useAppStore } from '../store/AppStoreContext'
import { PageHeader } from '../components/PageHeader'

type HabitsProps = {
  onNavigate: (page: Page) => void
}

export function Habits({ onNavigate }: HabitsProps) {
  const { data, removeHabit } = useAppStore()

  const handleRemove = (habit: Habit) => {
    const confirmed = window.confirm(
      `Remove "${habit.behaviour}"? Your completion history for this habit will be deleted too.`,
    )
    if (confirmed) removeHabit(habit.id)
  }

  return (
    <>
      <PageHeader
        title="All habits"
        subtitle="If-then plans anchored to cues."
        action={
          <button
            type="button"
            onClick={() => onNavigate('habit-create')}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            + Add habit
          </button>
        }
      />

      <div className="space-y-3">
        {data.habits.map((habit) => (
          <div
            key={habit.id}
            className="rounded-xl border border-border bg-surface-raised p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-text">{formatIfThen(habit)}</p>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-semibold text-accent">
                  {habit.automaticityScore}%
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(habit)}
                  className="text-xs text-text-muted hover:text-red-600"
                  aria-label={`Remove ${habit.behaviour}`}
                >
                  Remove
                </button>
              </div>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              {automaticityLabel(habit.automaticityScore)} · Tiny: {habit.tinyVersion}
            </p>
          </div>
        ))}
      </div>

      {data.habits.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-surface-raised p-8 text-center">
          <p className="font-medium text-text">No habits yet</p>
          <p className="mt-1 text-sm text-text-muted">
            Build an if-then habit with a cue anchor.
          </p>
        </div>
      )}
    </>
  )
}
