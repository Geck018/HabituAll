import { DEFAULT_PREFERENCES } from './defaults'
import { getPreset } from './presets'
import type {
  PreferenceOverrides,
  ProfileId,
  StoredPreferences,
  UserPreferences,
} from './types'

function mergeSection<T extends object>(base: T, override?: Partial<T>): T {
  if (!override) return { ...base }
  return { ...base, ...override }
}

export function mergePreferences(
  profileId: ProfileId,
  overrides: PreferenceOverrides = {},
): UserPreferences {
  const preset = getPreset(profileId)
  const merged = { ...DEFAULT_PREFERENCES, profileId }

  for (const [section, presetOverrides] of Object.entries(preset.overrides)) {
    const key = section as keyof UserPreferences
    if (key === 'profileId') continue
    const base = merged[key]
    if (typeof base === 'object' && base !== null) {
      ;(merged as Record<string, unknown>)[key] = mergeSection(
        base as object,
        presetOverrides as Partial<object>,
      )
    }
  }

  for (const [section, userOverrides] of Object.entries(overrides)) {
    const key = section as keyof UserPreferences
    if (key === 'profileId') continue
    const base = merged[key]
    if (typeof base === 'object' && base !== null) {
      ;(merged as Record<string, unknown>)[key] = mergeSection(
        base as object,
        userOverrides as Partial<object>,
      )
    }
  }

  return merged
}

export function loadStoredPreferences(): StoredPreferences {
  try {
    const raw = localStorage.getItem('habituall:prefs')
    if (!raw) {
      return { version: 1, profileId: 'general', overrides: {} }
    }
    const parsed = JSON.parse(raw) as StoredPreferences
    if (parsed.version !== 1) {
      return { version: 1, profileId: 'general', overrides: {} }
    }
    return parsed
  } catch {
    return { version: 1, profileId: 'general', overrides: {} }
  }
}

export function saveStoredPreferences(stored: StoredPreferences) {
  localStorage.setItem('habituall:prefs', JSON.stringify(stored))
}

export function resolvePreferences(stored?: StoredPreferences): UserPreferences {
  const s = stored ?? loadStoredPreferences()
  return mergePreferences(s.profileId, s.overrides)
}
