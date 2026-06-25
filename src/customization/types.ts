/** Profile presets — UX starting points, not diagnoses. */
export type ProfileId =
  | 'general'
  | 'adhd'
  | 'autism'
  | 'anxiety'
  | 'depression'
  | 'low_stimulation'
  | 'custom'

export type ThemeId = 'light' | 'dark' | 'system' | 'high_contrast' | 'muted'

export type ColorSchemeId = 'indigo' | 'teal' | 'rose' | 'amber' | 'slate' | 'custom'

export type DensityId = 'compact' | 'comfortable' | 'spacious'

export type MotionPreference = 'full' | 'reduced' | 'none'

export type LanguageTone = 'neutral' | 'encouraging' | 'gentle' | 'minimal' | 'literal'

export type ReminderStyle = 'soft' | 'standard' | 'persistent' | 'off'

export type DisplayPreferences = {
  theme: ThemeId
  colorScheme: ColorSchemeId
  customAccent?: string
  fontScale: number
  density: DensityId
  motion: MotionPreference
  roundedCorners: boolean
  showDecorativeIcons: boolean
}

export type CognitivePreferences = {
  /** Cap how many habits appear on the home screen */
  maxHabitsVisible: number
  /** Show only one habit at a time (focus mode) */
  singleHabitFocus: boolean
  /** Hide secondary text and metadata */
  simplifiedCards: boolean
  /** Collapse stats and charts by default */
  hideStatsByDefault: boolean
  /** Break habits into smaller sub-steps in the UI */
  preferMicroSteps: boolean
  /** Hide completion percentages / progress bars */
  hideProgressMetrics: boolean
}

export type InteractionPreferences = {
  largeTouchTargets: boolean
  confirmBeforeSkip: boolean
  confirmBeforeDelete: boolean
  /** Seconds undo stays available after completing a habit (0 = off) */
  undoWindowSeconds: number
  hapticFeedback: boolean
  keyboardShortcuts: boolean
}

export type HabitDisplayPreferences = {
  showStreaks: boolean
  showStreakFlames: boolean
  celebrateCompletion: boolean
  /** Softer celebration — no confetti, subtle check only */
  subtleCelebration: boolean
  allowSkipWithoutGuilt: boolean
  /** Replace “failed” / red states with neutral wording */
  neutralMissedState: boolean
  defaultHabitColor: string
}

export type ReminderPreferences = {
  enabled: boolean
  style: ReminderStyle
  maxPerDay: number
  quietHoursStart?: string
  quietHoursEnd?: string
}

export type LanguagePreferences = {
  tone: LanguageTone
  /** Avoid gamified words like “streak”, “level”, “crush it” */
  avoidGamificationLanguage: boolean
  /** Use plain, literal labels (helpful for some autistic users) */
  useLiteralLabels: boolean
}

export type PrivacyPreferences = {
  /** Opt in to encrypted cloud sync */
  syncEnabled: boolean
  /** Keep sensitive UI elements out of screenshots where OS allows */
  preferScreenPrivacy: boolean
  /** Auto-lock vault after idle minutes (0 = never) */
  autoLockMinutes: number
}

export type UserPreferences = {
  profileId: ProfileId
  display: DisplayPreferences
  cognitive: CognitivePreferences
  interaction: InteractionPreferences
  habits: HabitDisplayPreferences
  reminders: ReminderPreferences
  language: LanguagePreferences
  privacy: PrivacyPreferences
}

/** Partial overrides stored when user diverges from a preset */
export type PreferenceOverrides = {
  [K in keyof UserPreferences]?: Partial<UserPreferences[K]>
}

export type StoredPreferences = {
  version: 1
  profileId: ProfileId
  overrides: PreferenceOverrides
}
