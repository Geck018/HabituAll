import { useMemo, useState } from 'react'
import {
  getCompletionMessage,
  getNotTodayMessage,
  getResumeMessage,
} from '../copy/messages'
import { isCompletedToday, type Page } from '../domain/types'
import { automaticityOnComplete } from '../engine/automaticity'
import { HabitCard } from '../components/HabitCard'
import { MoodPrompt } from '../components/MoodPrompt'
import { MotivationalBanner } from '../components/MotivationalBanner'
import { NextUpCard } from '../components/NextUpCard'
import { PageHeader } from '../components/PageHeader'
import { RewardFeedback } from '../components/RewardFeedback'
import { useAppStore } from '../store/AppStoreContext'

type DashboardProps = {
  onNavigate: (page: Page) => void
}

type PendingMood = { habitId: string; tiny: boolean; prevScore: number }

type RewardState = {
  message: string
  pointsGained: number
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const {
    data,
    behaviour,
    completeHabit,
    skipHabitToday,
    dismissRecovery,
  } = useAppStore()

  const [pendingMood, setPendingMood] = useState<PendingMood | null>(null)
  const [reward, setReward] = useState<RewardState | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const todayHabits = data.habits

  const nextHabit = useMemo(() => {
    return data.habits.find((h) => !isCompletedToday(h))
  }, [data.habits])

  const completedCount = data.habits.filter((h) => isCompletedToday(h)).length

  const handleComplete = (habitId: string, tiny: boolean) => {
    const habit = data.habits.find((h) => h.id === habitId)
    if (!habit || isCompletedToday(habit)) return

    const prevScore = habit.automaticityScore

    if (behaviour.reward.trackMoodAfter) {
      setPendingMood({ habitId, tiny, prevScore })
      return
    }

    finishComplete(habitId, tiny, prevScore)
  }

  const finishComplete = (habitId: string, tiny: boolean, prevScore: number, moodAfter?: number) => {
    const newScore = automaticityOnComplete(prevScore, tiny)
    completeHabit(habitId, { usedTinyVersion: tiny, moodAfter })
    setReward({
      message: getCompletionMessage(behaviour.copyStyle),
      pointsGained: Math.round((newScore - prevScore) * 10) / 10,
    })
  }

  const handleSkip = (habitId: string) => {
    skipHabitToday(habitId)
    setToast(getNotTodayMessage(behaviour.copyStyle))
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <>
      <PageHeader
        title="Today"
        subtitle="Cued habits for today — one tap to complete, immediate feedback."
        action={
          <button
            type="button"
            onClick={() => onNavigate('habit-create')}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            + Habit
          </button>
        }
      />

      <MotivationalBanner personalization={data.user.personalization} />

      {behaviour.cues.showNextUpCard && nextHabit && (
        <div className="mb-6">
          <NextUpCard habit={nextHabit} />
        </div>
      )}

      {data.habits.length > 0 && (
        <p className="mb-4 text-sm text-text-muted">
          {completedCount} of {data.habits.length} completed today
        </p>
      )}

      {data.habits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-raised p-8 text-center">
          <p className="font-medium text-text">No habits yet</p>
          <p className="mt-1 text-sm text-text-muted">
            Create your first if-then habit — anchor it to a cue, not just a clock.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('habit-create')}
            className="mt-4 text-sm font-medium text-accent hover:underline"
          >
            Create habit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {todayHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              showRecovery={data.pendingRecovery.includes(habit.id)}
              onDismissRecovery={() => {
                dismissRecovery(habit.id)
                setToast(getResumeMessage(behaviour.copyStyle))
                setTimeout(() => setToast(null), 3500)
              }}
              onComplete={(tiny) => handleComplete(habit.id, tiny)}
              onSkipToday={() => handleSkip(habit.id)}
            />
          ))}
        </div>
      )}

      {pendingMood && (
        <MoodPrompt
          onSelect={(mood) => {
            finishComplete(
              pendingMood.habitId,
              pendingMood.tiny,
              pendingMood.prevScore,
              mood,
            )
            setPendingMood(null)
          }}
          onSkip={() => {
            finishComplete(pendingMood.habitId, pendingMood.tiny, pendingMood.prevScore)
            setPendingMood(null)
          }}
        />
      )}

      {reward && behaviour.reward.immediateFeedback && (
        <RewardFeedback
          message={reward.message}
          behaviour={behaviour}
          pointsGained={reward.pointsGained}
          onDone={() => setReward(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md rounded-xl border border-border bg-surface-raised px-4 py-3 text-center text-sm text-text shadow-lg md:bottom-8">
          {toast}
        </div>
      )}
    </>
  )
}
