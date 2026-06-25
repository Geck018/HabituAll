/**
 * Profile-adaptive behaviour config.
 *
 * Profiles are non-diagnostic, user-selected, and combinable.
 * All profile-specific UI/reward/cue behaviour is driven from this single config
 * so new profiles are easy to add.
 */
import type { LanguageTone } from '../customization/types'
import type { BehaviourProfileId } from '../domain/types'

export type RewardIntensity = 'subtle' | 'standard' | 'high'

export type ProfileBehaviourConfig = {
  id: BehaviourProfileId
  label: string
  description: string
  nonDiagnosticNote: string
  reward: {
    intensity: RewardIntensity
    /** Immediate visible feedback on every action */
    immediateFeedback: boolean
    showPoints: boolean
    showConfetti: boolean
    /** ADHD: occasional novelty in reward presentation */
    variableReward: boolean
    /** Autism: reward IS predictability — show what's next */
    predictabilityFocus: boolean
    /** Depression/anxiety: prompt mood-after to surface action→mood link */
    trackMoodAfter: boolean
  }
  cues: {
    strongExternalReminders: boolean
    showNextUpCard: boolean
    advanceChangeNoticeDays: number
    gradedChangeIntroduction: boolean
  }
  activation: {
    tinyVersionAlwaysVisible: boolean
    veryLowThreshold: boolean
  }
  tone: LanguageTone
  copyStyle: 'energetic' | 'warm' | 'literal' | 'reassuring' | 'neutral'
}

export const PROFILE_BEHAVIOUR_CONFIGS: Record<BehaviourProfileId, ProfileBehaviourConfig> = {
  general: {
    id: 'general',
    label: 'General',
    description: 'Standard immediate completion reward and automaticity tracking.',
    nonDiagnosticNote: 'Balanced defaults for everyday habit building.',
    reward: {
      intensity: 'standard',
      immediateFeedback: true,
      showPoints: false,
      showConfetti: false,
      variableReward: false,
      predictabilityFocus: false,
      trackMoodAfter: false,
    },
    cues: {
      strongExternalReminders: false,
      showNextUpCard: false,
      advanceChangeNoticeDays: 1,
      gradedChangeIntroduction: false,
    },
    activation: {
      tinyVersionAlwaysVisible: false,
      veryLowThreshold: false,
    },
    tone: 'encouraging',
    copyStyle: 'neutral',
  },
  adhd: {
    id: 'adhd',
    label: 'ADHD',
    description: 'Immediate, frequent, visible feedback. Smallest startable unit. Low shame.',
    nonDiagnosticNote: 'Not a diagnosis — choose if this matches how you work.',
    reward: {
      intensity: 'high',
      immediateFeedback: true,
      showPoints: true,
      showConfetti: true,
      variableReward: true,
      predictabilityFocus: false,
      trackMoodAfter: false,
    },
    cues: {
      strongExternalReminders: true,
      showNextUpCard: false,
      advanceChangeNoticeDays: 1,
      gradedChangeIntroduction: false,
    },
    activation: {
      tinyVersionAlwaysVisible: true,
      veryLowThreshold: true,
    },
    tone: 'encouraging',
    copyStyle: 'energetic',
  },
  depression: {
    id: 'depression',
    label: 'Depression',
    description: 'Behavioural activation: tiny steps, values-linked rewards, mood tracking.',
    nonDiagnosticNote: 'Not a diagnosis — supports low-energy days and meaningful action.',
    reward: {
      intensity: 'standard',
      immediateFeedback: true,
      showPoints: false,
      showConfetti: false,
      variableReward: false,
      predictabilityFocus: false,
      trackMoodAfter: true,
    },
    cues: {
      strongExternalReminders: false,
      showNextUpCard: false,
      advanceChangeNoticeDays: 2,
      gradedChangeIntroduction: false,
    },
    activation: {
      tinyVersionAlwaysVisible: true,
      veryLowThreshold: true,
    },
    tone: 'gentle',
    copyStyle: 'warm',
  },
  autism: {
    id: 'autism',
    label: 'Autism',
    description: 'Predictability, advance change notice, visual schedule, no surprise UI.',
    nonDiagnosticNote: 'Not a diagnosis — for those who need stable, literal routines.',
    reward: {
      intensity: 'subtle',
      immediateFeedback: true,
      showPoints: false,
      showConfetti: false,
      variableReward: false,
      predictabilityFocus: true,
      trackMoodAfter: false,
    },
    cues: {
      strongExternalReminders: false,
      showNextUpCard: true,
      advanceChangeNoticeDays: 3,
      gradedChangeIntroduction: true,
    },
    activation: {
      tinyVersionAlwaysVisible: true,
      veryLowThreshold: false,
    },
    tone: 'literal',
    copyStyle: 'literal',
  },
  anxiety: {
    id: 'anxiety',
    label: 'Anxiety',
    description: 'Small wins, graded steps, reassuring copy, optional mood check-in.',
    nonDiagnosticNote: 'Not a diagnosis — breaks avoidance into safe small steps.',
    reward: {
      intensity: 'standard',
      immediateFeedback: true,
      showPoints: false,
      showConfetti: false,
      variableReward: false,
      predictabilityFocus: false,
      trackMoodAfter: true,
    },
    cues: {
      strongExternalReminders: false,
      showNextUpCard: false,
      advanceChangeNoticeDays: 2,
      gradedChangeIntroduction: true,
    },
    activation: {
      tinyVersionAlwaysVisible: true,
      veryLowThreshold: true,
    },
    tone: 'gentle',
    copyStyle: 'reassuring',
  },
}

export type MergedProfileBehaviour = {
  profiles: BehaviourProfileId[]
  reward: ProfileBehaviourConfig['reward']
  cues: ProfileBehaviourConfig['cues']
  activation: ProfileBehaviourConfig['activation']
  tone: LanguageTone
  copyStyle: ProfileBehaviourConfig['copyStyle']
}

const INTENSITY_RANK: Record<RewardIntensity, number> = {
  subtle: 0,
  standard: 1,
  high: 2,
}

/** Merge combinable profiles — supportive features combine with OR; intensity takes max. */
export function mergeProfileBehaviour(
  profiles: BehaviourProfileId[],
): MergedProfileBehaviour {
  const ids = profiles.length > 0 ? profiles : (['general'] as BehaviourProfileId[])
  const configs = ids.map((id) => PROFILE_BEHAVIOUR_CONFIGS[id])

  const maxIntensity = configs.reduce<RewardIntensity>((best, c) => {
    return INTENSITY_RANK[c.reward.intensity] > INTENSITY_RANK[best]
      ? c.reward.intensity
      : best
  }, 'subtle')

  const maxNoticeDays = Math.max(...configs.map((c) => c.cues.advanceChangeNoticeDays))

  return {
    profiles: ids,
    reward: {
      intensity: maxIntensity,
      immediateFeedback: configs.some((c) => c.reward.immediateFeedback),
      showPoints: configs.some((c) => c.reward.showPoints),
      showConfetti: configs.some((c) => c.reward.showConfetti),
      variableReward: configs.some((c) => c.reward.variableReward),
      predictabilityFocus: configs.some((c) => c.reward.predictabilityFocus),
      trackMoodAfter: configs.some((c) => c.reward.trackMoodAfter),
    },
    cues: {
      strongExternalReminders: configs.some((c) => c.cues.strongExternalReminders),
      showNextUpCard: configs.some((c) => c.cues.showNextUpCard),
      advanceChangeNoticeDays: maxNoticeDays,
      gradedChangeIntroduction: configs.some((c) => c.cues.gradedChangeIntroduction),
    },
    activation: {
      tinyVersionAlwaysVisible: configs.some((c) => c.activation.tinyVersionAlwaysVisible),
      veryLowThreshold: configs.some((c) => c.activation.veryLowThreshold),
    },
    tone: configs[0]?.tone ?? 'encouraging',
    copyStyle: configs[0]?.copyStyle ?? 'neutral',
  }
}

export const ONBOARDING_PROFILE_OPTIONS = (
  Object.values(PROFILE_BEHAVIOUR_CONFIGS) as ProfileBehaviourConfig[]
).filter((p) => p.id !== 'general')
