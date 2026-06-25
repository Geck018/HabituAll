import { useEffect, useState } from 'react'
import type { MergedProfileBehaviour } from '../profiles/profileConfig'

type RewardFeedbackProps = {
  message: string
  behaviour: MergedProfileBehaviour
  pointsGained?: number
  onDone: () => void
}

export function RewardFeedback({ message, behaviour, pointsGained, onDone }: RewardFeedbackProps) {
  const [showConfetti, setShowConfetti] = useState(behaviour.reward.showConfetti)

  useEffect(() => {
    const t = setTimeout(onDone, behaviour.reward.intensity === 'high' ? 2200 : 1600)
    return () => clearTimeout(t)
  }, [onDone, behaviour.reward.intensity])

  useEffect(() => {
    if (behaviour.reward.variableReward && Math.random() > 0.6) {
      setShowConfetti(false)
    }
  }, [behaviour.reward.variableReward])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      role="dialog"
      aria-live="polite"
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface-raised p-6 text-center shadow-xl">
        {showConfetti && (
          <div className="mb-3 text-3xl" aria-hidden>
            ✦ ✧ ✦
          </div>
        )}
        {behaviour.reward.predictabilityFocus && (
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
            Completion recorded — same time tomorrow
          </p>
        )}
        <p className="text-lg font-semibold text-text">{message}</p>
        {behaviour.reward.showPoints && pointsGained != null && (
          <p className="mt-2 text-sm text-accent">+{pointsGained} automaticity</p>
        )}
        <button
          type="button"
          onClick={onDone}
          className="mt-5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
