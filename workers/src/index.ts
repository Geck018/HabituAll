/**
 * Cloudflare Worker — vault API skeleton.
 * Stores and returns ciphertext only. Never logs or inspects blob contents.
 */

export interface Env {
  DB: D1Database
  // AUTH_SECRET: string  // future: verify session JWT
}

type VaultRow = {
  user_id: string
  blob_id: string
  ciphertext: ArrayBuffer
  iv: ArrayBuffer
  version: number
  updated_at: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/health') {
      return Response.json({ ok: true, service: 'habituall-vault' })
    }

    if (url.pathname === '/api/vault') {
      const userId = request.headers.get('X-User-Id')
      if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      if (request.method === 'GET') {
        const row = await env.DB.prepare(
          'SELECT blob_id, ciphertext, iv, version, updated_at FROM user_vaults WHERE user_id = ?',
        )
          .bind(userId)
          .first<VaultRow>()

        if (!row) {
          return Response.json({ error: 'Not found' }, { status: 404 })
        }

        return Response.json({
          blobId: row.blob_id,
          ciphertext: arrayBufferToBase64(row.ciphertext),
          iv: arrayBufferToBase64(row.iv),
          version: row.version,
          updatedAt: row.updated_at,
        })
      }

      if (request.method === 'PUT') {
        const body = await request.json<{
          blobId: string
          ciphertext: string
          iv: string
          version: number
        }>()

        const now = new Date().toISOString()
        await env.DB.prepare(
          `INSERT INTO user_vaults (user_id, blob_id, ciphertext, iv, version, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(user_id) DO UPDATE SET
             blob_id = excluded.blob_id,
             ciphertext = excluded.ciphertext,
             iv = excluded.iv,
             version = excluded.version,
             updated_at = excluded.updated_at`,
        )
          .bind(
            userId,
            body.blobId,
            base64ToArrayBuffer(body.ciphertext),
            base64ToArrayBuffer(body.iv),
            body.version,
            now,
          )
          .run()

        return Response.json({ ok: true, updatedAt: now })
      }
    }

    return Response.json({ error: 'Not found' }, { status: 404 })
  },
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}
