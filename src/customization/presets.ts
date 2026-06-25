import type { PreferenceOverrides, ProfileId } from './types'

export type ProfilePreset = {
  id: ProfileId
  label: string
  description: string
  /** Research notes — to be expanded */
  researchNotes?: string
  overrides: PreferenceOverrides
}

export const PROFILE_PRESETS: ProfilePreset[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Balanced defaults for everyday habit tracking.',
    overrides: {},
  },
  {
    id: 'adhd',
    label: 'ADHD-friendly',
    description: 'Less clutter, forgiving undo, streak pressure off, larger tap targets.',
    researchNotes: 'Pending: executive function & notification timing research.',
    overrides: {
      cognitive: {
        maxHabitsVisible: 5,
        simplifiedCards: true,
        hideProgressMetrics: true,
      },
      interaction: {
        largeTouchTargets: true,
        undoWindowSeconds: 30,
      },
      habits: {
        showStreaks: false,
        showStreakFlames: false,
        celebrateCompletion: true,
        subtleCelebration: true,
        allowSkipWithoutGuilt: true,
      },
      language: {
        tone: 'gentle',
        avoidGamificationLanguage: true,
      },
    },
  },
  {
    id: 'autism',
    label: 'Autism-friendly',
    description: 'Predictable layout, reduced motion, literal labels, muted visuals.',
    researchNotes: 'Pending: sensory load & routine predictability research.',
    overrides: {
      display: {
        motion: 'reduced',
        showDecorativeIcons: false,
        colorScheme: 'slate',
      },
      cognitive: {
        simplifiedCards: true,
        hideStatsByDefault: true,
      },
      interaction: {
        confirmBeforeSkip: true,
      },
      habits: {
        showStreakFlames: false,
        celebrateCompletion: false,
        subtleCelebration: true,
        neutralMissedState: true,
      },
      language: {
        tone: 'literal',
        useLiteralLabels: true,
        avoidGamificationLanguage: true,
      },
    },
  },
  {
    id: 'anxiety',
    label: 'Anxiety-aware',
    description: 'Gentle copy, stats de-emphasized, no harsh missed-day cues.',
    researchNotes: 'Pending: performance anxiety & self-compassion research.',
    overrides: {
      cognitive: {
        hideStatsByDefault: true,
        hideProgressMetrics: true,
      },
      habits: {
        showStreaks: false,
        neutralMissedState: true,
        allowSkipWithoutGuilt: true,
        celebrateCompletion: true,
        subtleCelebration: true,
      },
      language: {
        tone: 'gentle',
        avoidGamificationLanguage: true,
      },
      reminders: {
        style: 'soft',
        maxPerDay: 2,
      },
    },
  },
  {
    id: 'depression',
    label: 'Depression-aware',
    description: 'Micro-steps, small wins celebrated, low daily bar.',
    researchNotes: 'Pending: behavioural activation & minimum viable routine research.',
    overrides: {
      cognitive: {
        maxHabitsVisible: 3,
        preferMicroSteps: true,
        singleHabitFocus: true,
        hideProgressMetrics: true,
      },
      habits: {
        showStreaks: false,
        celebrateCompletion: true,
        subtleCelebration: true,
        allowSkipWithoutGuilt: true,
        neutralMissedState: true,
      },
      language: {
        tone: 'gentle',
      },
      reminders: {
        style: 'soft',
        maxPerDay: 1,
      },
    },
  },
  {
    id: 'low_stimulation',
    label: 'Low stimulation',
    description: 'Muted palette, no gamification, minimal motion and decoration.',
    overrides: {
      display: {
        theme: 'muted',
        colorScheme: 'slate',
        motion: 'none',
        showDecorativeIcons: false,
        roundedCorners: false,
      },
      cognitive: {
        simplifiedCards: true,
        hideStatsByDefault: true,
      },
      habits: {
        showStreaks: false,
        showStreakFlames: false,
        celebrateCompletion: false,
      },
      language: {
        tone: 'minimal',
        avoidGamificationLanguage: true,
      },
      reminders: {
        enabled: false,
        style: 'off',
      },
    },
  },
]

export function getPreset(id: ProfileId) {
  return PROFILE_PRESETS.find((p) => p.id === id) ?? PROFILE_PRESETS[0]
}
