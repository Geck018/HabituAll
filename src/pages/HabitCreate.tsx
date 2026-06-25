import { useState } from 'react'
import type { CueType, Page } from '../domain/types'
import { valuesMotivationEmphasis } from '../profiles/personalityTraits'
import { useAppStore } from '../store/AppStoreContext'
import { PageHeader } from '../components/PageHeader'
import { HabitPrivacyNotice } from '../components/HabitPrivacyNotice'
import { SafetyBlockNotice } from '../components/SafetyBlockNotice'

type HabitCreateProps = {
  onNavigate: (page: Page) => void
}

export function HabitCreate({ onNavigate }: HabitCreateProps) {
  const { addHabit, data } = useAppStore()
  const [cueType, setCueType] = useState<CueType>('anchor')
  const [cueAnchor, setCueAnchor] = useState('')
  const [behaviourText, setBehaviourText] = useState('')
  const [tinyVersion, setTinyVersion] = useState('')
  const [valuesTag, setValuesTag] = useState('')
  const [leavingBehind, setLeavingBehind] = useState('')
  const [cueTime, setCueTime] = useState('')
  const [cuePlace, setCuePlace] = useState('')
  const [cueEvent, setCueEvent] = useState('')
  const [safetyError, setSafetyError] = useState<string | null>(null)

  const showValuesTag =
    data.user.profiles.includes('depression') ||
    valuesMotivationEmphasis(data.user.personality) ||
    Boolean(valuesTag)

  const canSubmit =
    behaviourText.trim() &&
    tinyVersion.trim() &&
    (cueType === 'anchor'
      ? cueAnchor.trim()
      : cueType === 'time_place'
        ? cueTime.trim() && cuePlace.trim()
        : (cueEvent.trim() || cueAnchor.trim()))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSafetyError(null)

    const err = addHabit({
      behaviour: behaviourText.trim(),
      cueType,
      cueAnchor: cueType === 'anchor' ? cueAnchor.trim() : cueEvent.trim() || cueAnchor.trim(),
      cueTime: cueType === 'time_place' ? cueTime.trim() : undefined,
      cuePlace: cueType === 'time_place' ? cuePlace.trim() : undefined,
      cueEvent: cueType === 'event' ? cueEvent.trim() : undefined,
      tinyVersion: tinyVersion.trim(),
      valuesTag: valuesTag.trim() || undefined,
      leavingBehind: leavingBehind.trim() || undefined,
    })

    if (err) {
      setSafetyError(err)
      return
    }

    onNavigate('dashboard')
  }

  return (
    <>
      <PageHeader
        title="New habit"
        subtitle='Use an if-then plan: "After I [cue], I will [behaviour]."'
      />

      <div className="mb-6 space-y-3">
        <HabitPrivacyNotice />
        {safetyError && <SafetyBlockNotice message={safetyError} />}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-text">Cue type</legend>
          {(
            [
              ['anchor', 'Existing routine (preferred)', 'After I finish something I already do…'],
              ['time_place', 'Time + place', 'When and where…'],
              ['event', 'Event / task juncture', 'When something happens…'],
            ] as const
          ).map(([value, label, hint]) => (
            <label
              key={value}
              className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                cueType === value ? 'border-accent bg-accent/5' : 'border-border bg-surface-raised'
              }`}
            >
              <input
                type="radio"
                name="cueType"
                value={value}
                checked={cueType === value}
                onChange={() => setCueType(value)}
                className="mt-1"
              />
              <div>
                <span className="block font-medium text-text">{label}</span>
                <span className="text-sm text-text-muted">{hint}</span>
              </div>
            </label>
          ))}
        </fieldset>

        {cueType === 'anchor' && (
          <label className="block">
            <span className="text-sm font-medium text-text">After I…</span>
            <input
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              placeholder="e.g. brush my teeth"
              value={cueAnchor}
              onChange={(e) => setCueAnchor(e.target.value)}
              required
            />
          </label>
        )}

        {cueType === 'time_place' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-text">Time</span>
              <input
                type="time"
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                value={cueTime}
                onChange={(e) => setCueTime(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-text">Place</span>
              <input
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                placeholder="e.g. kitchen"
                value={cuePlace}
                onChange={(e) => setCuePlace(e.target.value)}
                required
              />
            </label>
          </div>
        )}

        {cueType === 'event' && (
          <label className="block">
            <span className="text-sm font-medium text-text">When…</span>
            <input
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              placeholder="e.g. I sit down at my desk"
              value={cueEvent}
              onChange={(e) => setCueEvent(e.target.value)}
              required
            />
          </label>
        )}

        <label className="block">
          <span className="text-sm font-medium text-text">I will…</span>
          <span className="mt-0.5 block text-xs text-text-muted">
            The new behaviour you&apos;re building — this part is safety-checked.
          </span>
          <input
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            placeholder="e.g. floss one tooth"
            value={behaviourText}
            onChange={(e) => setBehaviourText(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-text">What I&apos;m moving away from (optional)</span>
          <span className="mt-0.5 block text-xs text-text-muted">
            Name the old habit, urge, or pattern you&apos;re replacing — including difficult ones.
            This field is private, encrypted, and not filtered, so you can be honest about what
            you&apos;re trying to quit.
          </span>
          <input
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            placeholder="e.g. doom-scrolling, smoking, hurting myself when overwhelmed"
            value={leavingBehind}
            onChange={(e) => setLeavingBehind(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-text">Tiny version (always available)</span>
          <span className="mt-0.5 block text-xs text-text-muted">
            Lowest activation threshold — for hard days. Still counts.
          </span>
          <input
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            placeholder="e.g. hold floss for 5 seconds"
            value={tinyVersion}
            onChange={(e) => setTinyVersion(e.target.value)}
            required
          />
        </label>

        {showValuesTag && (
          <label className="block">
            <span className="text-sm font-medium text-text">Values tag (optional)</span>
            <span className="mt-0.5 block text-xs text-text-muted">
              Link to what matters — supports behavioural activation and values-based motivation.
            </span>
            <input
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              placeholder="e.g. self-care, connection, health"
              value={valuesTag}
              onChange={(e) => setValuesTag(e.target.value)}
            />
          </label>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onNavigate('habits')}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex-1 rounded-lg bg-accent py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            Save habit
          </button>
        </div>
      </form>
    </>
  )
}
