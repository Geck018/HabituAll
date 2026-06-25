import { useMemo } from 'react'
import {
  automaticityLabel,
  automaticityTimelineMessage,
} from '../engine/automaticity'
import { HONEST_TIMELINE_BANNER } from '../copy/messages'
import type { Page } from '../domain/types'
import { PageHeader } from '../components/PageHeader'
import { useAppStore } from '../store/AppStoreContext'

type ProgressProps = {
  onNavigate: (page: Page) => void
}

export function Progress({ onNavigate }: ProgressProps) {
  const { data, behaviour } = useAppStore()

  const moodCompletions = useMemo(
    () => data.completions.filter((c) => c.moodAfter != null),
    [data.completions],
  )

  const avgAutomaticity =
    data.habits.length > 0
      ? Math.round(
          (data.habits.reduce((s, h) => s + h.automaticityScore, 0) / data.habits.length) * 10,
        ) / 10
      : 0

  if (data.habits.length === 0) {
    return (
      <>
        <PageHeader title="Progress" subtitle="Automaticity curves — not streaks." />
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-text-muted">Add habits to see your automaticity grow.</p>
          <button
            type="button"
            onClick={() => onNavigate('habit-create')}
            className="mt-3 text-sm font-medium text-accent hover:underline"
          >
            Create a habit
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Progress"
        subtitle="Smooth automaticity curves — a missed day dips slightly, never resets."
      />

      <div className="mb-6 rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm text-text">
        {HONEST_TIMELINE_BANNER}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-surface-raised p-4">
          <p className="text-sm text-text-muted">Average automaticity</p>
          <p className="mt-1 text-2xl font-semibold text-text">{avgAutomaticity}%</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-raised p-4">
          <p className="text-sm text-text-muted">Active habits</p>
          <p className="mt-1 text-2xl font-semibold text-text">{data.habits.length}</p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text">Per-habit automaticity</h2>
        {data.habits.map((habit) => {
          const history = data.completions
            .filter((c) => c.habitId === habit.id)
            .slice(-14)
            .map((c) => c.automaticityAfter)

          return (
            <div
              key={habit.id}
              className="rounded-xl border border-border bg-surface-raised p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-text">{habit.behaviour}</p>
                  <p className="text-xs text-text-muted">
                    {automaticityLabel(habit.automaticityScore)}
                  </p>
                </div>
                <p className="text-lg font-semibold text-accent">{habit.automaticityScore}%</p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${habit.automaticityScore}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-text-muted">
                {automaticityTimelineMessage(habit.automaticityScore)}
              </p>

              {history.length > 1 && (
                <div className="mt-4 flex h-16 items-end gap-1">
                  {history.map((score, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-accent/30"
                      style={{ height: `${score}%` }}
                      title={`${score}%`}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </section>

      {behaviour.reward.trackMoodAfter && moodCompletions.length > 0 && (
        <section className="mt-8 rounded-xl border border-border bg-surface-raised p-4">
          <h2 className="text-lg font-semibold text-text">Action → mood</h2>
          <p className="mt-1 text-sm text-text-muted">
            Mood after completing a habit (behavioural activation link).
          </p>
          <div className="mt-4 flex h-24 items-end gap-2">
            {moodCompletions.slice(-10).map((c) => (
              <div key={c.id} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-teal-500/60"
                  style={{ height: `${(c.moodAfter ?? 1) * 20}%` }}
                />
                <span className="text-[10px] text-text-muted">
                  {new Date(c.completedAt).toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
