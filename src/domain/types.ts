/**
 * Core domain types — mirrors planned D1 schema (inside encrypted vault).
 *
 * users(id, profile[], tone_pref, created_at)
 * habits(id, user_id, behaviour, cue_type, cue_anchor, tiny_version, values_tag, automaticity_score, created_at)
 * completions(id, habit_id, completed_at, mood_after?)
 */

export type BehaviourProfileId = 'general' | 'adhd' | 'depression' | 'autism' | 'anxiety'

export type PersonalityTraitTagId =
  | 'needs_structure'
  | 'easily_overwhelmed'
  | 'enjoys_variety'
  | 'self_critical'
  | 'values_driven'
  | 'needs_reassurance'

/** Self-reported temperament — 1 (low) to 5 (high), 3 = typical. Not a clinical measure. */
export type PersonalityTraits = {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
  tags: PersonalityTraitTagId[]
  /** Optional free text, e.g. "night owl" — stored for the user, not parsed for behaviour */
  customNotes?: string
  configured: boolean
}

export type CueType = 'anchor' | 'time_place' | 'event'

export type HabitChangeNotice = {
  id: string
  message: string
  effectiveDate: string
  /** autism profile: staged rollout */
  graded: boolean
  announcedAt: string
}

export type EncryptedSecret = {
  ciphertext: string
  iv: string
}

/** On disk — habit text lives only inside `secret` (AES-256-GCM). */
export type StoredHabit = {
  id: string
  userId: string
  automaticityScore: number
  color: string
  createdAt: string
  lastCompletedDate?: string
  lastMissProcessedDate?: string
  secret: EncryptedSecret
}

export type Habit = {
  id: string
  userId: string
  behaviour: string
  cueType: CueType
  /** Primary cue text — e.g. "brush my teeth" for anchor type */
  cueAnchor: string
  cueTime?: string
  cuePlace?: string
  cueEvent?: string
  tinyVersion: string
  valuesTag?: string
  /**
   * Old habit or urge the user is quitting/replacing.
   * Intentionally exempt from content-safety filters so recovery goals can be named honestly.
   */
  leavingBehind?: string
  automaticityScore: number
  color: string
  createdAt: string
  /** Last calendar day (YYYY-MM-DD) habit was completed */
  lastCompletedDate?: string
  /** Last calendar day a miss was processed (prevents double-dip) */
  lastMissProcessedDate?: string
  pendingChange?: HabitChangeNotice
}

export type Completion = {
  id: string
  habitId: string
  completedAt: string
  usedTinyVersion: boolean
  /** 1–5 optional mood rating (behavioural activation link) */
  moodAfter?: number
  /** automaticity score after this completion */
  automaticityAfter: number
}

export type UserPersonalization = {
  /** Data URL or remote URL — stored per-user */
  backgroundImage?: string
  /** 0–0.85 dark overlay on background for text readability */
  backgroundDim?: number
  /** User-written motivational line (any language) */
  motivationalText?: string
  motivationalAuthor?: string
}

export type UserRecord = {
  id: string
  username: string
  profiles: BehaviourProfileId[]
  personality?: PersonalityTraits
  tonePref?: string
  onboardingComplete: boolean
  createdAt: string
  personalization: UserPersonalization
}

export type AppData = {
  version: 4
  user: UserRecord
  habits: Habit[]
  completions: Completion[]
  pendingRecovery: string[]
}

/** Serialized to localStorage — habits are encrypted blobs only */
export type RawAppData = {
  version: 4
  user: UserRecord
  habits: StoredHabit[]
  completions: Completion[]
  pendingRecovery: string[]
}

export type Page =
  | 'onboarding'
  | 'dashboard'
  | 'habits'
  | 'habit-create'
  | 'progress'
  | 'research'
  | 'settings'

/** Formatted if-then cue for display */
export function formatIfThen(habit: Habit): string {
  const plan = (() => {
    switch (habit.cueType) {
      case 'anchor':
        return `After I ${habit.cueAnchor}, I will ${habit.behaviour}`
      case 'time_place':
        return `When it is ${habit.cueTime ?? '—'} at ${habit.cuePlace ?? '—'}, I will ${habit.behaviour}`
      case 'event':
        return `When ${habit.cueEvent ?? habit.cueAnchor}, I will ${habit.behaviour}`
    }
  })()

  if (habit.leavingBehind?.trim()) {
    return `${plan} — instead of ${habit.leavingBehind.trim()}`
  }
  return plan
}

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function isCompletedToday(habit: Habit): boolean {
  return habit.lastCompletedDate === todayDateString()
}
