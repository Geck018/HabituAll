import type { CueType, EncryptedSecret, Habit, HabitChangeNotice, StoredHabit } from '../domain/types'
import { decryptJson, encryptJson } from '../privacy/crypto'

/** Sensitive habit content — encrypted at rest; only opaque ciphertext on disk. */
export type HabitSecretPayload = {
  cueType: CueType
  behaviour: string
  cueAnchor: string
  cueTime?: string
  cuePlace?: string
  cueEvent?: string
  tinyVersion: string
  valuesTag?: string
  leavingBehind?: string
  pendingChange?: HabitChangeNotice
}

export type LegacyPlaintextHabit = StoredHabit & Partial<HabitSecretPayload> & {
  secret?: EncryptedSecret
}

export const HABIT_PRIVACY_NOTICE =
  'Your habit text (what you do, your cues, and values tags) is encrypted on this device with your password. Only anonymous metadata (like progress scores) is stored in plain form. Without your password, the content cannot be read — including by us when sync ships.'

export async function encryptHabitSecret(
  key: CryptoKey,
  payload: HabitSecretPayload,
): Promise<EncryptedSecret> {
  return encryptJson(key, payload)
}

export async function decryptHabitSecret(
  key: CryptoKey,
  secret: EncryptedSecret,
): Promise<HabitSecretPayload> {
  return decryptJson<HabitSecretPayload>(key, secret.ciphertext, secret.iv)
}

function habitMeta(stored: LegacyPlaintextHabit): Omit<Habit, keyof HabitSecretPayload> {
  return {
    id: stored.id,
    userId: stored.userId,
    automaticityScore: stored.automaticityScore,
    color: stored.color,
    createdAt: stored.createdAt,
    lastCompletedDate: stored.lastCompletedDate,
    lastMissProcessedDate: stored.lastMissProcessedDate,
  }
}

export async function storedToHabit(stored: LegacyPlaintextHabit, key: CryptoKey): Promise<Habit> {
  if (stored.secret?.ciphertext) {
    const payload = await decryptHabitSecret(key, stored.secret)
    return { ...habitMeta(stored), ...payload }
  }

  // Legacy plaintext habit — migrate in memory; re-saved encrypted on next persist
  const payload: HabitSecretPayload = {
    cueType: stored.cueType ?? 'anchor',
    behaviour: stored.behaviour ?? '',
    cueAnchor: stored.cueAnchor ?? '',
    cueTime: stored.cueTime,
    cuePlace: stored.cuePlace,
    cueEvent: stored.cueEvent,
    tinyVersion: stored.tinyVersion ?? '',
    valuesTag: stored.valuesTag,
    leavingBehind: stored.leavingBehind,
    pendingChange: stored.pendingChange,
  }
  await encryptHabitSecret(key, payload)
  return { ...habitMeta(stored), ...payload }
}

export async function habitToStored(habit: Habit, key: CryptoKey): Promise<StoredHabit> {
  const payload: HabitSecretPayload = {
    cueType: habit.cueType,
    behaviour: habit.behaviour,
    cueAnchor: habit.cueAnchor,
    cueTime: habit.cueTime,
    cuePlace: habit.cuePlace,
    cueEvent: habit.cueEvent,
    tinyVersion: habit.tinyVersion,
    valuesTag: habit.valuesTag,
    leavingBehind: habit.leavingBehind,
    pendingChange: habit.pendingChange,
  }
  const secret = await encryptHabitSecret(key, payload)
  return {
    id: habit.id,
    userId: habit.userId,
    automaticityScore: habit.automaticityScore,
    color: habit.color,
    createdAt: habit.createdAt,
    lastCompletedDate: habit.lastCompletedDate,
    lastMissProcessedDate: habit.lastMissProcessedDate,
    secret,
  }
}

export async function decryptHabits(
  stored: LegacyPlaintextHabit[],
  key: CryptoKey,
): Promise<Habit[]> {
  return Promise.all(stored.map((h) => storedToHabit(h, key)))
}

export async function encryptHabits(habits: Habit[], key: CryptoKey): Promise<StoredHabit[]> {
  return Promise.all(habits.map((h) => habitToStored(h, key)))
}
