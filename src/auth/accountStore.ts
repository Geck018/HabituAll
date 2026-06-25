import { createDefaultAppData, saveRawAppData } from '../store/appData'
import { generateDataSalt } from './dataKey'
import { hashPassword, verifyPassword } from './password'
import { generateUsername, isValidPassword, isValidUsername, normalizeUsername } from './usernameGenerator'

const AUTH_INDEX_KEY = 'habituall:auth-index'
const SESSION_KEY = 'habituall:session'
const LEGACY_APP_KEY = 'habituall:app-data'

export type AccountRecord = {
  username: string
  userId: string
  passwordHash: string
  salt: string
  /** Present on all accounts after encryption rollout; backfilled on unlock/login */
  dataSalt?: string
  createdAt: string
}

function saveAccount(account: AccountRecord) {
  localStorage.setItem(accountKey(account.username), JSON.stringify(account))
}

export type Session = {
  username: string
  userId: string
}

function accountKey(username: string) {
  return `habituall:account:${username}`
}

function readIndex(): string[] {
  try {
    const raw = localStorage.getItem(AUTH_INDEX_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeIndex(usernames: string[]) {
  localStorage.setItem(AUTH_INDEX_KEY, JSON.stringify(usernames))
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function saveSession(session: Session | null) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

export function getAccount(username: string): AccountRecord | null {
  const raw = localStorage.getItem(accountKey(username))
  if (!raw) return null
  return JSON.parse(raw) as AccountRecord
}

export function isUsernameTaken(username: string): boolean {
  return readIndex().includes(username)
}

export async function registerAccount(
  rawUsername: string,
  password: string,
): Promise<{ ok: true; session: Session } | { ok: false; error: string }> {
  const username = normalizeUsername(rawUsername)

  if (!isValidUsername(username)) {
    return { ok: false, error: 'Username needs at least 3 characters (letters, numbers, hyphens).' }
  }
  if (!isValidPassword(password)) {
    return { ok: false, error: 'Password must be at least 8 characters.' }
  }
  if (isUsernameTaken(username)) {
    return { ok: false, error: 'That username is taken on this device. Try another or regenerate.' }
  }

  const { hash, salt } = await hashPassword(password)
  const userId = crypto.randomUUID()

  const account: AccountRecord = {
    username,
    userId,
    passwordHash: hash,
    salt,
    dataSalt: generateDataSalt(),
    createdAt: new Date().toISOString(),
  }

  const index = readIndex()
  index.push(username)
  writeIndex(index)
  localStorage.setItem(accountKey(username), JSON.stringify(account))

  if (!adoptLegacyAppData(userId)) {
    const empty = createDefaultAppData(userId, username)
    saveRawAppData(userId, { ...empty, habits: [] })
  }

  const session = { username, userId }
  saveSession(session)
  return { ok: true, session }
}

export async function loginAccount(
  rawUsername: string,
  password: string,
): Promise<{ ok: true; session: Session } | { ok: false; error: string }> {
  const username = normalizeUsername(rawUsername)
  const account = getAccount(username)

  if (!account) {
    return { ok: false, error: 'No account with that username on this device.' }
  }

  const valid = await verifyPassword(password, account.salt, account.passwordHash)
  if (!valid) {
    return { ok: false, error: 'Incorrect password.' }
  }

  if (!account.dataSalt) {
    account.dataSalt = generateDataSalt()
    saveAccount(account)
  }

  const session = { username: account.username, userId: account.userId }
  saveSession(session)
  return { ok: true, session }
}

/** Verify password and ensure encryption salt exists (for unlock without full re-login). */
export async function verifyAccountForUnlock(
  rawUsername: string,
  password: string,
): Promise<{ ok: true; account: AccountRecord } | { ok: false; error: string }> {
  const username = normalizeUsername(rawUsername)
  const account = getAccount(username)

  if (!account) {
    return { ok: false, error: 'No account with that username on this device.' }
  }

  const valid = await verifyPassword(password, account.salt, account.passwordHash)
  if (!valid) {
    return { ok: false, error: 'Incorrect password.' }
  }

  if (!account.dataSalt) {
    account.dataSalt = generateDataSalt()
    saveAccount(account)
  }

  return { ok: true, account }
}

export function logoutAccount() {
  saveSession(null)
}

function appDataKey(userId: string) {
  return `habituall:app-data:${userId}`
}

/** One-time: move legacy single-user blob to this account */
function adoptLegacyAppData(userId: string): boolean {
  try {
    const raw = localStorage.getItem(LEGACY_APP_KEY)
    if (!raw) return false
    localStorage.removeItem(LEGACY_APP_KEY)
    localStorage.setItem(appDataKey(userId), raw)
    return true
  } catch {
    return false
  }
}

export function suggestAvailableUsername(): string {
  let candidate = generateUsername()
  let attempts = 0
  while (isUsernameTaken(candidate) && attempts < 20) {
    candidate = generateUsername()
    attempts++
  }
  return candidate
}
