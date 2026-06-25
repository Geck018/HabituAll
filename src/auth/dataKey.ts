import { fromBase64 } from '../privacy/crypto'
import { deriveKeyFromPassphrase } from '../privacy/crypto'

/** Derive AES-256-GCM key for habit encryption (separate salt from auth hash). */
export async function deriveDataKey(password: string, dataSaltB64: string): Promise<CryptoKey> {
  const salt = fromBase64(dataSaltB64)
  const { key } = await deriveKeyFromPassphrase(password, salt)
  return key
}

export function generateDataSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}
