import { useMemo } from 'react'
import type { PersonalityTraitTagId, PersonalityTraits } from '../domain/types'
import {
  DEFAULT_PERSONALITY_TRAITS,
  describePersonalityAdaptations,
  PERSONALITY_DIMENSIONS,
  PERSONALITY_TRAIT_TAGS,
} from '../profiles/personalityTraits'

type PersonalityTraitsEditorProps = {
  value: PersonalityTraits
  onChange: (traits: PersonalityTraits) => void
  showPreview?: boolean
  compact?: boolean
}

export function PersonalityTraitsEditor({
  value,
  onChange,
  showPreview = true,
  compact = false,
}: PersonalityTraitsEditorProps) {
  const previewNotes = useMemo(() => describePersonalityAdaptations(value), [value])

  const setDimension = (id: (typeof PERSONALITY_DIMENSIONS)[number]['id'], next: number) => {
    onChange({
      ...value,
      configured: true,
      [id]: next,
    })
  }

  const toggleTag = (tagId: PersonalityTraitTagId) => {
    const tags = value.tags ?? []
    const next = tags.includes(tagId) ? tags.filter((t) => t !== tagId) : [...tags, tagId]
    onChange({
      ...value,
      configured: true,
      tags: next,
    })
  }

  const useDefaults = () => {
    onChange({ ...DEFAULT_PERSONALITY_TRAITS, configured: false })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {PERSONALITY_DIMENSIONS.map((dim) => (
          <div
            key={dim.id}
            className={`rounded-xl border border-border bg-surface-raised ${compact ? 'p-3' : 'p-4'}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-text">{dim.label}</span>
              <span className="text-xs text-text-muted">
                {value[dim.id] <= 2 ? dim.lowLabel : value[dim.id] >= 4 ? dim.highLabel : 'Typical'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={value[dim.id]}
              onChange={(e) => setDimension(dim.id, parseInt(e.target.value, 10))}
              className="mt-3 w-full"
              aria-label={dim.label}
            />
            <div className="mt-1 flex justify-between text-xs text-text-muted">
              <span>Low</span>
              <span>Typical</span>
              <span>High</span>
            </div>
            {!compact && (
              <p className="mt-2 text-xs text-text-muted">{dim.researchNote}</p>
            )}
          </div>
        ))}
      </div>

      <div>
        <p className="text-sm font-medium text-text">Anything else that fits you?</p>
        <p className="mt-1 text-xs text-text-muted">
          Plain-language traits — combined with profiles above, not a diagnosis.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {PERSONALITY_TRAIT_TAGS.map((tag) => {
            const active = value.tags?.includes(tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`rounded-xl border p-3 text-left text-sm transition-colors ${
                  active ? 'border-accent bg-accent/5' : 'border-border bg-surface-raised hover:border-slate-300'
                }`}
              >
                <span className="block font-medium text-text">{tag.label}</span>
                <span className="mt-1 block text-xs text-text-muted">{tag.description}</span>
              </button>
            )
          })}
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-text">In your own words (optional)</span>
        <span className="mt-0.5 block text-xs text-text-muted">
          e.g. &quot;night owl&quot;, &quot;hates mornings&quot; — saved for you; behaviour uses the sliders and tags above.
        </span>
        <textarea
          className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          rows={2}
          value={value.customNotes ?? ''}
          onChange={(e) =>
            onChange({
              ...value,
              customNotes: e.target.value || undefined,
              configured: value.configured || e.target.value.length > 0,
            })
          }
          placeholder="Anything you want to remember about how you work best…"
        />
      </label>

      {showPreview && value.configured && previewNotes.length > 0 && (
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
          <p className="text-sm font-medium text-text">How the app will adapt</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-text-muted">
            {previewNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {value.configured && (
        <button
          type="button"
          onClick={useDefaults}
          className="text-sm text-text-muted hover:text-text"
        >
          Reset to neutral defaults
        </button>
      )}

      <p className="text-xs text-text-muted">
        Informed by habit and personality psychology (e.g. Gardner et al., 2024; Wood &amp; Neal;
        implementation intentions). Self-report only — not a clinical assessment.
      </p>
    </div>
  )
}
