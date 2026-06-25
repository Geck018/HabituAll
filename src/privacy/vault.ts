import {
  decryptJson,
  deriveKeyFromPassphrase,
  encryptJson,
  fromBase64,
  generateSalt,
  toBase64,
} from './crypto'
import type { EncryptedBlobDto, VaultPayload, VaultState } from './types'
import { VAULT_SALT_KEY, VAULT_STORAGE_KEY } from './types'

type Session = {
  key: CryptoKey
  payload: VaultPayload
}

let session: Session | null = null

function emptyPayload(): VaultPayload {
  return {
    version: 1,
    habits: [],
    updatedAt: new Date().toISOString(),
  }
}

export function getVaultState(): VaultState {
  if (session) {
    return { status: 'unlocked', payload: session.payload }
  }
  return { status: 'locked' }
}

export function lockVault() {
  session = null
}

export async function unlockVault(passphrase: string): Promise<VaultState> {
  try {
    const saltB64 = localStorage.getItem(VAULT_SALT_KEY)
    const encryptedB64 = localStorage.getItem(VAULT_STORAGE_KEY)

    if (!saltB64) {
      const salt = await generateSalt()
      const { key } = await deriveKeyFromPassphrase(passphrase, salt)
      const payload = emptyPayload()
      const blob = await encryptJson(key, payload)
      localStorage.setItem(VAULT_SALT_KEY, toBase64(salt))
      localStorage.setItem(
        VAULT_STORAGE_KEY,
        JSON.stringify({ ciphertext: blob.ciphertext, iv: blob.iv, version: 1 }),
      )
      session = { key, payload }
      return { status: 'unlocked', payload }
    }

    const salt = fromBase64(saltB64)
    const { key } = await deriveKeyFromPassphrase(passphrase, salt)

    if (!encryptedB64) {
      const payload = emptyPayload()
      session = { key, payload }
      await persistVault()
      return { status: 'unlocked', payload }
    }

    const stored = JSON.parse(encryptedB64) as { ciphertext: string; iv: string }
    const payload = await decryptJson<VaultPayload>(key, stored.ciphertext, stored.iv)
    session = { key, payload }
    return { status: 'unlocked', payload }
  } catch {
    return { status: 'error', message: 'Wrong passphrase or corrupted vault data.' }
  }
}

export async function persistVault(): Promise<EncryptedBlobDto | null> {
  if (!session) return null

  session.payload.updatedAt = new Date().toISOString()
  const { ciphertext, iv } = await encryptJson(session.key, session.payload)
  const blob = {
    blobId: crypto.randomUUID(),
    ciphertext,
    iv,
    version: 1,
    updatedAt: session.payload.updatedAt,
  }

  localStorage.setItem(
    VAULT_STORAGE_KEY,
    JSON.stringify({ ciphertext: blob.ciphertext, iv: blob.iv, version: blob.version }),
  )

  return blob
}

export function updateVaultPayload(updater: (payload: VaultPayload) => VaultPayload) {
  if (!session) return
  session.payload = updater(session.payload)
}

export function exportVaultForSync(): EncryptedBlobDto | null {
  const raw = localStorage.getItem(VAULT_STORAGE_KEY)
  if (!raw) return null
  const stored = JSON.parse(raw) as { ciphertext: string; iv: string; version: number }
  return {
    blobId: crypto.randomUUID(),
    ciphertext: stored.ciphertext,
    iv: stored.iv,
    version: stored.version,
    updatedAt: new Date().toISOString(),
  }
}
