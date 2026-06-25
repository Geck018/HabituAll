import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  loadSession,
  loginAccount,
  logoutAccount,
  registerAccount,
  suggestAvailableUsername,
  type Session,
} from './accountStore'
import { generateUsername } from './usernameGenerator'

type AuthContextValue = {
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<string | null>
  register: (username: string, password: string) => Promise<string | null>
  logout: () => void
  suggestUsername: () => string
  regenerateUsername: () => string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setSession(loadSession())
    setIsLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const result = await loginAccount(username, password)
    if (!result.ok) return result.error
    setSession(result.session)
    return null
  }, [])

  const register = useCallback(async (username: string, password: string) => {
    const result = await registerAccount(username, password)
    if (!result.ok) return result.error
    setSession(result.session)
    return null
  }, [])

  const logout = useCallback(() => {
    logoutAccount()
    setSession(null)
  }, [])

  const suggestUsername = useCallback(() => suggestAvailableUsername(), [])

  const regenerateUsername = useCallback(() => generateUsername(), [])

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: session !== null,
      isLoading,
      login,
      register,
      logout,
      suggestUsername,
      regenerateUsername,
    }),
    [session, isLoading, login, register, logout, suggestUsername, regenerateUsername],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
