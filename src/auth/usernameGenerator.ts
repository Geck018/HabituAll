/**
 * GitHub-style random usernames: {colour}-{animal}-{number}
 * e.g. coral-penguin-42, sage-otter-7
 *
 * Simple English words — readable globally as opaque handles (no PII).
 */

const COLOURS = [
  'amber',
  'azure',
  'coral',
  'crimson',
  'emerald',
  'golden',
  'indigo',
  'ivory',
  'jade',
  'lavender',
  'magenta',
  'mint',
  'navy',
  'olive',
  'pearl',
  'ruby',
  'sage',
  'silver',
  'sunset',
  'teal',
  'violet',
] as const

const ANIMALS = [
  'badger',
  'bear',
  'crane',
  'dolphin',
  'eagle',
  'falcon',
  'fox',
  'heron',
  'koala',
  'lynx',
  'moose',
  'otter',
  'owl',
  'panda',
  'penguin',
  'rabbit',
  'raven',
  'sparrow',
  'tiger',
  'turtle',
  'whale',
  'wolf',
] as const

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function randomSuffix(): number {
  return Math.floor(Math.random() * 90) + 10
}

export function generateUsername(): string {
  return `${pick(COLOURS)}-${pick(ANIMALS)}-${randomSuffix()}`
}

/** Lowercase alphanumeric + hyphens; 3–40 chars */
export function normalizeUsername(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 40)
}

export function isValidUsername(username: string): boolean {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(username) && username.length >= 3
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8
}
