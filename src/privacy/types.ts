/** Opaque blob stored server-side — no plaintext fields */
export type EncryptedBlobDto = {
  blobId: string
  ciphertext: string
  iv: string
  version: number
  updatedAt: string
}

export type VaultPayload = {
  version: 1
  habits: unknown[]
  preferences?: unknown
  notes?: string
  updatedAt: string
}

export type VaultState =
  | { status: 'locked' }
  | { status: 'unlocked'; payload: VaultPayload }
  | { status: 'error'; message: string }

export type DerivedKeyMaterial = {
  key: CryptoKey
  salt: Uint8Array
}

export const VAULT_STORAGE_KEY = 'habituall:vault:encrypted'
export const VAULT_SALT_KEY = 'habituall:vault:salt'
