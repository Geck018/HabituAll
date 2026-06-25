import type { EncryptedBlobDto } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? ''

/**
 * Sync client — uploads/downloads ciphertext only.
 * Server never receives passphrase or decryption keys.
 */
export const syncClient = {
  async upload(userId: string, blob: EncryptedBlobDto): Promise<{ ok: boolean; updatedAt?: string }> {
    if (!API_URL) {
      console.info('[sync] VITE_API_URL not set — sync skipped (local only)')
      return { ok: false }
    }

    const res = await fetch(`${API_URL}/api/vault`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
      body: JSON.stringify({
        blobId: blob.blobId,
        ciphertext: blob.ciphertext,
        iv: blob.iv,
        version: blob.version,
      }),
    })

    if (!res.ok) return { ok: false }
    const data = await res.json() as { updatedAt: string }
    return { ok: true, updatedAt: data.updatedAt }
  },

  async download(userId: string): Promise<EncryptedBlobDto | null> {
    if (!API_URL) return null

    const res = await fetch(`${API_URL}/api/vault`, {
      headers: { 'X-User-Id': userId },
    })

    if (!res.ok) return null
    return res.json() as Promise<EncryptedBlobDto>
  },
}
