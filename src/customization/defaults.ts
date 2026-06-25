import type { UserPreferences } from './types'

export const DEFAULT_PREFERENCES: UserPreferences = {
  profileId: 'general',
  display: {
    theme: 'light',
    colorScheme: 'indigo',
    fontScale: 1,
    density: 'comfortable',
    motion: 'full',
    roundedCorners: true,
    showDecorativeIcons: true,
  },
  cognitive: {
    maxHabitsVisible: 10,
    singleHabitFocus: false,
    simplifiedCards: false,
    hideStatsByDefault: false,
    preferMicroSteps: false,
    hideProgressMetrics: false,
  },
  interaction: {
    largeTouchTargets: false,
    confirmBeforeSkip: false,
    confirmBeforeDelete: true,
    undoWindowSeconds: 5,
    hapticFeedback: false,
    keyboardShortcuts: true,
  },
  habits: {
    showStreaks: true,
    showStreakFlames: false,
    celebrateCompletion: true,
    subtleCelebration: false,
    allowSkipWithoutGuilt: false,
    neutralMissedState: false,
    defaultHabitColor: '#4f46e5',
  },
  reminders: {
    enabled: false,
    style: 'soft',
    maxPerDay: 3,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  },
  language: {
    tone: 'encouraging',
    avoidGamificationLanguage: false,
    useLiteralLabels: false,
  },
  privacy: {
    syncEnabled: false,
    preferScreenPrivacy: false,
    autoLockMinutes: 15,
  },
}
