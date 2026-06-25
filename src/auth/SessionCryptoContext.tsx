import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import { verifyAccountForUnlock } from './accountStore'
import { deriveDataKey } from './dataKey'

type SessionCryptoContextValue = {
  dataKey: CryptoKey | null
  isUnlocked: boolean
  unlock: (username: string, password: string) => Promise<string | null>
  lock: () => void
}

const SessionCryptoContext = createContext<SessionCryptoContextValue | null>(null)

export function SessionCryptoProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [dataKey, setDataKey] = useState<CryptoKey | null>(null)

  const lock = useCallback(() => {
    setDataKey(null)
  }, [])

  useEffect(() => {
    if (!session) lock()
  }, [session, lock])

  const unlock = useCallback(async (username: string, password: string) => {
    const verified = await verifyAccountForUnlock(username, password)
    if (!verified.ok) return verified.error

    try {
      const key = await deriveDataKey(password, verified.account.dataSalt!)
      setDataKey(key)
      return null
    } catch {
      return 'Could not unlock encrypted data.'
    }
  }, [])

  const value = useMemo(
    () => ({
      dataKey,
      isUnlocked: dataKey !== null,
      unlock,
      lock,
    }),
    [dataKey, unlock, lock],
  )

  return (
    <SessionCryptoContext.Provider value={value}>{children}</SessionCryptoContext.Provider>
  )
}

export function useSessionCrypto() {
  const ctx = useContext(SessionCryptoContext)
  if (!ctx) throw new Error('useSessionCrypto must be used within SessionCryptoProvider')
  return ctx
}
