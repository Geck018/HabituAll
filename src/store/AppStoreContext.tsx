import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '../auth/AuthContext'
import { useSessionCrypto } from '../auth/SessionCryptoContext'
import { automaticityOnComplete, automaticityOnMiss } from '../engine/automaticity'
import type {
  AppData,
  BehaviourProfileId,
  Completion,
  Habit,
  PersonalityTraits,
  UserPersonalization,
} from '../domain/types'
import { todayDateString } from '../domain/types'
import { DEFAULT_PERSONALITY_TRAITS, applyPersonalityAdaptation } from '../profiles/personalityTraits'
import { mergeProfileBehaviour } from '../profiles/profileConfig'
import { checkHabitReplacementContent, contentSafetyError } from '../safety/contentModeration'
import { decryptHabits, encryptHabits } from '../privacy/habitCrypto'
import {
  createCompletion,
  createHabit,
  getHabitsFromRaw,
  loadRawAppData,
  saveRawAppData,
} from './appData'

type CompleteHabitOptions = {
  usedTinyVersion: boolean
  moodAfter?: number
}

type AppStoreValue = {
  data: AppData
  behaviour: ReturnType<typeof mergeProfileBehaviour>
  completeOnboarding: (profiles: BehaviourProfileId[], personality?: PersonalityTraits) => string | null
  setProfiles: (profiles: BehaviourProfileId[]) => void
  setPersonalityTraits: (traits: PersonalityTraits) => string | null
  updatePersonalization: (patch: Partial<UserPersonalization>) => string | null
  addHabit: (input: Omit<Habit, 'id' | 'userId' | 'automaticityScore' | 'createdAt' | 'color'>) => string | null
  removeHabit: (habitId: string) => void
  completeHabit: (habitId: string, options: CompleteHabitOptions) => void
  skipHabitToday: (habitId: string) => void
  dismissRecovery: (habitId: string) => void
  getHabitCompletions: (habitId: string) => Completion[]
}

const AppStoreContext = createContext<AppStoreValue | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const { dataKey, isUnlocked } = useSessionCrypto()
  const [data, setData] = useState<AppData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!session || !dataKey || !isUnlocked) {
      setData(null)
      return
    }

    let cancelled = false
    setLoadError(null)

    ;(async () => {
      try {
        const raw = loadRawAppData(session.userId, session.username)
        const habits = await decryptHabits(getHabitsFromRaw(raw), dataKey)
        if (!cancelled) {
          setData({ ...raw, habits })
        }
      } catch {
        if (!cancelled) {
          setLoadError('Could not decrypt your habits. Check your password and try again.')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [session?.userId, session?.username, dataKey, isUnlocked])

  useEffect(() => {
    if (!data || !session || !dataKey || !isUnlocked) return

    let cancelled = false
    ;(async () => {
      try {
        const encrypted = await encryptHabits(data.habits, dataKey)
        if (!cancelled) {
          saveRawAppData(session.userId, {
            version: 4,
            user: data.user,
            habits: encrypted,
            completions: data.completions,
            pendingRecovery: data.pendingRecovery,
          })
        }
      } catch {
        if (!cancelled) {
          setLoadError('Could not save encrypted habits.')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [data, session, dataKey, isUnlocked])

  const behaviour = useMemo(() => {
    const base = mergeProfileBehaviour(data?.user.profiles ?? ['general'])
    return applyPersonalityAdaptation(base, data?.user.personality)
  }, [data?.user.profiles, data?.user.personality])

  const completeOnboarding = useCallback(
    (profiles: BehaviourProfileId[], personality?: PersonalityTraits): string | null => {
      const safetyErr = contentSafetyError(personality?.customNotes)
      if (safetyErr) return safetyErr

      setData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          user: {
            ...prev.user,
            profiles: profiles.length > 0 ? profiles : ['general'],
            personality: personality ?? prev.user.personality ?? { ...DEFAULT_PERSONALITY_TRAITS },
            onboardingComplete: true,
          },
        }
      })
      return null
    },
    [],
  )

  const setProfiles = useCallback((profiles: BehaviourProfileId[]) => {
    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        user: {
          ...prev.user,
          profiles: profiles.length > 0 ? profiles : ['general'],
        },
      }
    })
  }, [])

  const setPersonalityTraits = useCallback((traits: PersonalityTraits): string | null => {
    const safetyErr = contentSafetyError(traits.customNotes)
    if (safetyErr) return safetyErr

    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        user: {
          ...prev.user,
          personality: traits,
        },
      }
    })
    return null
  }, [])

  const updatePersonalization = useCallback((patch: Partial<UserPersonalization>): string | null => {
    const safetyErr = contentSafetyError(patch.motivationalText, patch.motivationalAuthor)
    if (safetyErr) return safetyErr

    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        user: {
          ...prev.user,
          personalization: { ...prev.user.personalization, ...patch },
        },
      }
    })
    return null
  }, [])

  const addHabit = useCallback(
    (
      input: Omit<Habit, 'id' | 'userId' | 'automaticityScore' | 'createdAt' | 'color'>,
    ): string | null => {
      const safetyErr = checkHabitReplacementContent({
        behaviour: input.behaviour,
        cueAnchor: input.cueAnchor,
        cueTime: input.cueTime,
        cuePlace: input.cuePlace,
        cueEvent: input.cueEvent,
        tinyVersion: input.tinyVersion,
        valuesTag: input.valuesTag,
        leavingBehind: input.leavingBehind,
      })
      if (safetyErr) return safetyErr

      setData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          habits: [...prev.habits, createHabit(prev.user.id, input, prev.habits.length)],
        }
      })
      return null
    },
    [],
  )

  const removeHabit = useCallback((habitId: string) => {
    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        habits: prev.habits.filter((h) => h.id !== habitId),
        completions: prev.completions.filter((c) => c.habitId !== habitId),
        pendingRecovery: prev.pendingRecovery.filter((id) => id !== habitId),
      }
    })
  }, [])

  const completeHabit = useCallback((habitId: string, options: CompleteHabitOptions) => {
    setData((prev) => {
      if (!prev) return prev
      const habit = prev.habits.find((h) => h.id === habitId)
      if (!habit) return prev

      const newScore = automaticityOnComplete(habit.automaticityScore, options.usedTinyVersion)
      const completion = createCompletion(
        habitId,
        options.usedTinyVersion,
        newScore,
        options.moodAfter,
      )

      return {
        ...prev,
        habits: prev.habits.map((h) =>
          h.id === habitId
            ? { ...h, automaticityScore: newScore, lastCompletedDate: todayDateString() }
            : h,
        ),
        completions: [...prev.completions, completion],
        pendingRecovery: prev.pendingRecovery.filter((id) => id !== habitId),
      }
    })
  }, [])

  const skipHabitToday = useCallback((habitId: string) => {
    setData((prev) => {
      if (!prev) return prev
      const today = todayDateString()
      const habit = prev.habits.find((h) => h.id === habitId)
      if (!habit || habit.lastMissProcessedDate === today || habit.lastCompletedDate === today) {
        return prev
      }

      const newScore = automaticityOnMiss(habit.automaticityScore)

      return {
        ...prev,
        habits: prev.habits.map((h) =>
          h.id === habitId
            ? { ...h, automaticityScore: newScore, lastMissProcessedDate: today }
            : h,
        ),
        pendingRecovery: prev.pendingRecovery.includes(habitId)
          ? prev.pendingRecovery
          : [...prev.pendingRecovery, habitId],
      }
    })
  }, [])

  const dismissRecovery = useCallback((habitId: string) => {
    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        pendingRecovery: prev.pendingRecovery.filter((id) => id !== habitId),
      }
    })
  }, [])

  const getHabitCompletions = useCallback(
    (habitId: string) => data?.completions.filter((c) => c.habitId === habitId) ?? [],
    [data?.completions],
  )

  const value = useMemo(() => {
    if (!data) return null
    return {
      data,
      behaviour,
      completeOnboarding,
      setProfiles,
      setPersonalityTraits,
      updatePersonalization,
      addHabit,
      removeHabit,
      completeHabit,
      skipHabitToday,
      dismissRecovery,
      getHabitCompletions,
    }
  }, [
    data,
    behaviour,
    completeOnboarding,
    setProfiles,
    setPersonalityTraits,
    updatePersonalization,
    addHabit,
    removeHabit,
    completeHabit,
    skipHabitToday,
    dismissRecovery,
    getHabitCompletions,
  ])

  if (loadError) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4 text-center text-sm text-red-600">
        {loadError}
      </div>
    )
  }

  if (!value) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-text-muted">
        Loading your encrypted data…
      </div>
    )
  }

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider (after login)')
  return ctx
}

export function useProfileBehaviour() {
  return useAppStore().behaviour
}
