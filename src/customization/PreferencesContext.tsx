import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { applyPreferences } from './applyPreferences'
import {
  loadStoredPreferences,
  mergePreferences,
  saveStoredPreferences,
} from './mergePreferences'
import type {
  PreferenceOverrides,
  ProfileId,
  StoredPreferences,
  UserPreferences,
} from './types'

type PreferencesContextValue = {
  preferences: UserPreferences
  stored: StoredPreferences
  setProfile: (profileId: ProfileId) => void
  updateOverrides: (overrides: PreferenceOverrides) => void
  updateSection: <K extends keyof PreferenceOverrides>(
    section: K,
    patch: PreferenceOverrides[K],
  ) => void
  resetToProfile: () => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredPreferences>(loadStoredPreferences)

  const preferences = useMemo(
    () => mergePreferences(stored.profileId, stored.overrides),
    [stored],
  )

  useEffect(() => {
    applyPreferences(preferences)
    saveStoredPreferences(stored)
  }, [preferences, stored])

  const setProfile = useCallback((profileId: ProfileId) => {
    setStored((prev) => ({
      ...prev,
      profileId,
      overrides: profileId === 'custom' ? prev.overrides : {},
    }))
  }, [])

  const updateOverrides = useCallback((overrides: PreferenceOverrides) => {
    setStored((prev) => ({
      ...prev,
      profileId: 'custom',
      overrides: { ...prev.overrides, ...overrides },
    }))
  }, [])

  const updateSection = useCallback(
    <K extends keyof PreferenceOverrides>(section: K, patch: PreferenceOverrides[K]) => {
      setStored((prev) => ({
        ...prev,
        profileId: 'custom',
        overrides: {
          ...prev.overrides,
          [section]: { ...(prev.overrides[section] ?? {}), ...patch },
        },
      }))
    },
    [],
  )

  const resetToProfile = useCallback(() => {
    setStored((prev) => ({
      ...prev,
      profileId: prev.profileId === 'custom' ? 'general' : prev.profileId,
      overrides: {},
    }))
  }, [])

  const value = useMemo(
    () => ({
      preferences,
      stored,
      setProfile,
      updateOverrides,
      updateSection,
      resetToProfile,
    }),
    [preferences, stored, setProfile, updateOverrides, updateSection, resetToProfile],
  )

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) {
    throw new Error('usePreferences must be used within PreferencesProvider')
  }
  return ctx
}
