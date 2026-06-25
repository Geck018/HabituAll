import type { Habit } from '../domain/types'
import { formatIfThen } from '../domain/types'

type NextUpCardProps = {
  habit: Habit
}

export function NextUpCard({ habit }: NextUpCardProps) {
  return (
    <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Next up</p>
      <p className="mt-1 text-sm text-text">{formatIfThen(habit)}</p>
      <p className="mt-2 text-xs text-text-muted">
        Tiny version available: {habit.tinyVersion}
      </p>
    </div>
  )
}
