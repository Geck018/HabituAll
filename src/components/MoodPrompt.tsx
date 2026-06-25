type MoodPromptProps = {
  onSelect: (mood: number) => void
  onSkip: () => void
}

const MOOD_LABELS = ['Very low', 'Low', 'Okay', 'Good', 'Great']

export function MoodPrompt({ onSelect, onSkip }: MoodPromptProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface-raised p-6 shadow-xl">
        <p className="font-medium text-text">How do you feel right now?</p>
        <p className="mt-1 text-sm text-text-muted">
          Optional — helps link action to mood over time.
        </p>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {MOOD_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(i + 1)}
              className="rounded-lg border border-border py-2 text-xs font-medium text-text hover:border-accent hover:bg-accent/5"
              title={label}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="mt-4 w-full text-sm text-text-muted hover:text-text"
        >
          Skip
        </button>
      </div>
    </div>
  )
}
