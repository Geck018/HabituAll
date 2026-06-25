import { DEFAULT_PERSONALITY_TRAITS, PERSONALITY_NEUTRAL } from '../profiles/personalityTraits'
import { todayDateString } from '../domain/types'
import type {
  AppData,
  Completion,
  Habit,
  PersonalityTraits,
  RawAppData,
  UserPersonalization,
} from '../domain/types'
import type { LegacyPlaintextHabit } from '../privacy/habitCrypto'

function appDataKey(userId: string) {
  return `habituall:app-data:${userId}`
}

const DEFAULT_PERSONALIZATION: UserPersonalization = {
  backgroundDim: 0.45,
}

function createDefaultUser(userId: string, username: string): AppData['user'] {
  return {
    id: userId,
    username,
    profiles: ['general'],
    onboardingComplete: false,
    createdAt: new Date().toISOString(),
    personalization: { ...DEFAULT_PERSONALIZATION },
  }
}

export function createDefaultAppData(userId: string, username: string): AppData {
  return {
    version: 4,
    user: createDefaultUser(userId, username),
    habits: [],
    completions: [],
    pendingRecovery: [],
  }
}

function normalizePersonality(raw?: PersonalityTraits): PersonalityTraits {
  if (!raw) return { ...DEFAULT_PERSONALITY_TRAITS }
  return {
    openness: raw.openness ?? PERSONALITY_NEUTRAL,
    conscientiousness: raw.conscientiousness ?? PERSONALITY_NEUTRAL,
    extraversion: raw.extraversion ?? PERSONALITY_NEUTRAL,
    agreeableness: raw.agreeableness ?? PERSONALITY_NEUTRAL,
    neuroticism: raw.neuroticism ?? PERSONALITY_NEUTRAL,
    tags: raw.tags ?? [],
    customNotes: raw.customNotes,
    configured: raw.configured ?? false,
  }
}

function normalizeRaw(parsed: Partial<RawAppData> & { version?: number }, userId: string, username: string): RawAppData {
  const user = parsed.user ?? ({} as AppData['user'])
  return {
    version: 4,
    user: {
      id: userId,
      username: user.username ?? username,
      profiles: user.profiles ?? ['general'],
      personality: normalizePersonality(user.personality),
      onboardingComplete: user.onboardingComplete ?? false,
      createdAt: user.createdAt ?? new Date().toISOString(),
      tonePref: user.tonePref,
      personalization: {
        ...DEFAULT_PERSONALIZATION,
        ...user.personalization,
      },
    },
    habits: (parsed.habits ?? []) as RawAppData['habits'],
    completions: parsed.completions ?? [],
    pendingRecovery: parsed.pendingRecovery ?? [],
  }
}

export function loadRawAppData(userId: string, username: string): RawAppData {
  try {
    const raw = localStorage.getItem(appDataKey(userId))
    if (!raw) {
      const empty = createDefaultAppData(userId, username)
      return { ...empty, habits: [] }
    }
    const parsed = JSON.parse(raw) as Partial<RawAppData> & { version?: number }
    return normalizeRaw(parsed, userId, username)
  } catch {
    const empty = createDefaultAppData(userId, username)
    return { ...empty, habits: [] }
  }
}

export function saveRawAppData(userId: string, data: RawAppData) {
  localStorage.setItem(appDataKey(userId), JSON.stringify(data))
}

/** Habits on disk may be legacy plaintext (pre-encryption) */
export function getHabitsFromRaw(raw: RawAppData): LegacyPlaintextHabit[] {
  return raw.habits as LegacyPlaintextHabit[]
}

const HABIT_COLORS = ['#4f46e5', '#0d9488', '#e11d48', '#d97706', '#6366f1', '#0ea5e9']

export function nextHabitColor(index: number): string {
  return HABIT_COLORS[index % HABIT_COLORS.length]
}

export function createHabit(
  userId: string,
  input: Omit<Habit, 'id' | 'userId' | 'automaticityScore' | 'createdAt' | 'color'> & {
    color?: string
  },
  colorIndex: number,
): Habit {
  return {
    id: crypto.randomUUID(),
    userId,
    automaticityScore: 0,
    color: input.color ?? nextHabitColor(colorIndex),
    createdAt: new Date().toISOString(),
    behaviour: input.behaviour,
    cueType: input.cueType,
    cueAnchor: input.cueAnchor,
    cueTime: input.cueTime,
    cuePlace: input.cuePlace,
    cueEvent: input.cueEvent,
    tinyVersion: input.tinyVersion,
    valuesTag: input.valuesTag,
    leavingBehind: input.leavingBehind,
    pendingChange: input.pendingChange,
  }
}

export function createCompletion(
  habitId: string,
  usedTinyVersion: boolean,
  automaticityAfter: number,
  moodAfter?: number,
): Completion {
  return {
    id: crypto.randomUUID(),
    habitId,
    completedAt: new Date().toISOString(),
    usedTinyVersion,
    automaticityAfter,
    moodAfter,
  }
}

export function habitCompletedToday(habit: Habit): boolean {
  return habit.lastCompletedDate === todayDateString()
}

export function getTodayCompletions(completions: Completion[]): Completion[] {
  const today = todayDateString()
  return completions.filter((c) => c.completedAt.startsWith(today))
}

export const MAX_BACKGROUND_BYTES = 2 * 1024 * 1024

export async function readImageAsDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.')
  }
  if (file.size > MAX_BACKGROUND_BYTES) {
    throw new Error('Image must be under 2 MB.')
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Could not read image.'))
    reader.readAsDataURL(file)
  })
}
