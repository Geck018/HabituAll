/**
 * Personality-informed UX adaptation.
 *
 * Uses self-reported Big Five-style dimensions and plain-language trait tags.
 * Not a clinical assessment — adjusts cues, copy, and rewards within
 * research-backed habit-formation principles (implementation intentions,
 * behavioural activation, cue-response learning, graded change).
 */
import type { PersonalityTraits, PersonalityTraitTagId } from '../domain/types'
import type { MergedProfileBehaviour, ProfileBehaviourConfig } from './profileConfig'

export const PERSONALITY_NEUTRAL = 3

export const DEFAULT_PERSONALITY_TRAITS: PersonalityTraits = {
  openness: PERSONALITY_NEUTRAL,
  conscientiousness: PERSONALITY_NEUTRAL,
  extraversion: PERSONALITY_NEUTRAL,
  agreeableness: PERSONALITY_NEUTRAL,
  neuroticism: PERSONALITY_NEUTRAL,
  tags: [],
  configured: false,
}

export type PersonalityDimensionMeta = {
  id: keyof Pick<
    PersonalityTraits,
    'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'
  >
  label: string
  lowLabel: string
  highLabel: string
  researchNote: string
}

export const PERSONALITY_DIMENSIONS: PersonalityDimensionMeta[] = [
  {
    id: 'conscientiousness',
    label: 'Planning & follow-through',
    lowLabel: 'I rely on cues and tiny starts',
    highLabel: 'I usually stick to plans',
    researchNote:
      'Low conscientiousness benefits from external cues and implementation intentions (Gollwitzer; Wood & Neal).',
  },
  {
    id: 'neuroticism',
    label: 'Stress sensitivity',
    lowLabel: 'Missed days feel manageable',
    highLabel: 'Setbacks can feel heavy',
    researchNote:
      'Higher sensitivity pairs with reassuring copy and graded steps — no streak punishment (behavioural activation).',
  },
  {
    id: 'extraversion',
    label: 'Energy from action',
    lowLabel: 'Quiet, low-key feedback',
    highLabel: 'Visible wins energise me',
    researchNote:
      'Immediate visible feedback supports habit reinforcement across temperaments (Lally et al.).',
  },
  {
    id: 'openness',
    label: 'Comfort with change',
    lowLabel: 'I prefer predictable routines',
    highLabel: 'Novelty keeps me engaged',
    researchNote:
      'Stable contexts strengthen cue-response learning; novelty can sustain engagement when introduced carefully (Wood & Neal).',
  },
  {
    id: 'agreeableness',
    label: 'Values & self-kindness',
    lowLabel: 'Direct, neutral language',
    highLabel: 'Warm, values-linked motivation',
    researchNote:
      'Linking behaviour to personal values supports sustained change (behavioural activation; Gardner et al.).',
  },
]

export type PersonalityTraitTag = {
  id: PersonalityTraitTagId
  label: string
  description: string
}

export const PERSONALITY_TRAIT_TAGS: PersonalityTraitTag[] = [
  {
    id: 'needs_structure',
    label: 'I do better with clear structure',
    description: 'Advance notice before changes, predictable layout.',
  },
  {
    id: 'easily_overwhelmed',
    label: 'Small steps help me avoid overwhelm',
    description: 'Tiny versions and low activation thresholds.',
  },
  {
    id: 'enjoys_variety',
    label: 'Fresh presentation keeps me engaged',
    description: 'Occasional variety in completion feedback.',
  },
  {
    id: 'self_critical',
    label: 'I can be hard on myself',
    description: 'Gentle copy — no streak shame, resume-focused.',
  },
  {
    id: 'values_driven',
    label: 'Connecting habits to my values motivates me',
    description: 'Emphasis on values tags when building habits.',
  },
  {
    id: 'needs_reassurance',
    label: 'Reassuring language helps me keep going',
    description: 'Calm, safety-oriented messaging on skips and misses.',
  },
]

type TraitLevel = 'low' | 'mid' | 'high'

const COPY_STYLE_RANK: Record<ProfileBehaviourConfig['copyStyle'], number> = {
  neutral: 0,
  energetic: 1,
  warm: 2,
  reassuring: 3,
  literal: 4,
}

function traitLevel(value: number): TraitLevel {
  if (value <= 2) return 'low'
  if (value >= 4) return 'high'
  return 'mid'
}

function pickCopyStyle(
  current: ProfileBehaviourConfig['copyStyle'],
  candidate: ProfileBehaviourConfig['copyStyle'],
): ProfileBehaviourConfig['copyStyle'] {
  return COPY_STYLE_RANK[candidate] > COPY_STYLE_RANK[current] ? candidate : current
}

function bumpIntensity(
  current: ProfileBehaviourConfig['reward']['intensity'],
): ProfileBehaviourConfig['reward']['intensity'] {
  if (current === 'subtle') return 'standard'
  if (current === 'standard') return 'high'
  return 'high'
}

function cloneBehaviour(base: MergedProfileBehaviour): MergedProfileBehaviour {
  return {
    ...base,
    reward: { ...base.reward },
    cues: { ...base.cues },
    activation: { ...base.activation },
  }
}

function applyTag(
  result: MergedProfileBehaviour,
  tagId: PersonalityTraitTagId,
): MergedProfileBehaviour {
  switch (tagId) {
    case 'needs_structure':
      result.reward.predictabilityFocus = true
      result.cues.advanceChangeNoticeDays = Math.max(result.cues.advanceChangeNoticeDays, 3)
      result.cues.gradedChangeIntroduction = true
      break
    case 'easily_overwhelmed':
      result.activation.tinyVersionAlwaysVisible = true
      result.activation.veryLowThreshold = true
      result.cues.gradedChangeIntroduction = true
      break
    case 'enjoys_variety':
      result.reward.variableReward = true
      break
    case 'self_critical':
      result.copyStyle = pickCopyStyle(result.copyStyle, 'warm')
      result.reward.showPoints = false
      break
    case 'values_driven':
      result.copyStyle = pickCopyStyle(result.copyStyle, 'warm')
      break
    case 'needs_reassurance':
      result.copyStyle = pickCopyStyle(result.copyStyle, 'reassuring')
      result.reward.trackMoodAfter = true
      break
  }
  return result
}

/** Layer personality-informed tweaks on top of merged behaviour profiles. */
export function applyPersonalityAdaptation(
  base: MergedProfileBehaviour,
  traits?: PersonalityTraits | null,
): MergedProfileBehaviour {
  if (!traits?.configured) return base

  const result = cloneBehaviour(base)

  const conscientiousness = traitLevel(traits.conscientiousness)
  if (conscientiousness === 'low') {
    result.activation.tinyVersionAlwaysVisible = true
    result.activation.veryLowThreshold = true
    result.cues.strongExternalReminders = true
    result.cues.showNextUpCard = true
  }

  const neuroticism = traitLevel(traits.neuroticism)
  if (neuroticism === 'high') {
    result.reward.trackMoodAfter = true
    result.cues.gradedChangeIntroduction = true
    result.cues.advanceChangeNoticeDays = Math.max(result.cues.advanceChangeNoticeDays, 2)
    result.copyStyle = pickCopyStyle(result.copyStyle, 'reassuring')
  } else if (neuroticism === 'low') {
    result.copyStyle = pickCopyStyle(result.copyStyle, 'neutral')
  }

  const extraversion = traitLevel(traits.extraversion)
  if (extraversion === 'high') {
    result.reward.variableReward = true
    result.reward.showPoints = true
    result.reward.intensity = bumpIntensity(result.reward.intensity)
    result.copyStyle = pickCopyStyle(result.copyStyle, 'energetic')
  } else if (extraversion === 'low') {
    result.reward.intensity =
      result.reward.intensity === 'high' ? 'standard' : result.reward.intensity
    result.reward.showConfetti = false
  }

  const openness = traitLevel(traits.openness)
  if (openness === 'high') {
    result.reward.variableReward = true
  } else if (openness === 'low') {
    result.reward.predictabilityFocus = true
    result.cues.gradedChangeIntroduction = true
    result.cues.advanceChangeNoticeDays = Math.max(result.cues.advanceChangeNoticeDays, 2)
    result.copyStyle = pickCopyStyle(result.copyStyle, 'literal')
  }

  const agreeableness = traitLevel(traits.agreeableness)
  if (agreeableness === 'high') {
    result.copyStyle = pickCopyStyle(result.copyStyle, 'warm')
    result.tone = 'gentle'
  }

  for (const tagId of traits.tags ?? []) {
    applyTag(result, tagId)
  }

  return result
}

export function valuesMotivationEmphasis(traits?: PersonalityTraits | null): boolean {
  if (!traits?.configured) return false
  return (
    traits.tags?.includes('values_driven') ||
    traitLevel(traits.agreeableness) === 'high'
  )
}

export function describePersonalityAdaptations(traits: PersonalityTraits): string[] {
  if (!traits.configured) return []

  const notes: string[] = []

  if (traitLevel(traits.conscientiousness) === 'low') {
    notes.push('Cue-anchored tiny starts and a “next up” focus — offloads planning to the environment.')
  }
  if (traitLevel(traits.neuroticism) === 'high') {
    notes.push('Reassuring copy, optional mood check-ins, and graded changes — no streak resets.')
  }
  if (traitLevel(traits.extraversion) === 'high') {
    notes.push('More visible completion feedback when you finish a habit.')
  }
  if (traitLevel(traits.extraversion) === 'low') {
    notes.push('Quieter celebrations — progress without pressure.')
  }
  if (traitLevel(traits.openness) === 'low') {
    notes.push('Predictable routines and advance notice before habit changes.')
  }
  if (traitLevel(traits.openness) === 'high') {
    notes.push('Occasional variety in rewards to keep engagement fresh.')
  }
  if (traitLevel(traits.agreeableness) === 'high') {
    notes.push('Warm, values-friendly language throughout the app.')
  }

  for (const tag of PERSONALITY_TRAIT_TAGS) {
    if (traits.tags?.includes(tag.id)) {
      notes.push(`${tag.label} — ${tag.description}`)
    }
  }

  return notes
}
