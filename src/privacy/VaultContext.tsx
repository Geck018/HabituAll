import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { exportVaultForSync, getVaultState, lockVault, persistVault, unlockVault } from './vault'
import type { VaultState } from './types'
import { syncClient } from './syncClient'

type VaultContextValue = {
  state: VaultState
  unlock: (passphrase: string) => Promise<VaultState>
  lock: () => void
  sync: (userId: string) => Promise<boolean>
}

const VaultContext = createContext<VaultContextValue | null>(null)

export function VaultProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VaultState>(getVaultState)

  const unlock = useCallback(async (passphrase: string) => {
    const next = await unlockVault(passphrase)
    setState(next)
    return next
  }, [])

  const lock = useCallback(() => {
    lockVault()
    setState({ status: 'locked' })
  }, [])

  const sync = useCallback(async (userId: string) => {
    await persistVault()
    const blob = exportVaultForSync()
    if (!blob) return false
    const result = await syncClient.upload(userId, blob)
    return result.ok
  }, [])

  return (
    <VaultContext.Provider value={{ state, unlock, lock, sync }}>
      {children}
    </VaultContext.Provider>
  )
}

export function useVault() {
  const ctx = useContext(VaultContext)
  if (!ctx) throw new Error('useVault must be used within VaultProvider')
  return ctx
}
