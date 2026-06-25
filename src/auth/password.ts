import { fromBase64, toBase64 } from '../privacy/crypto'

const AUTH_ITERATIONS = 600_000

async function deriveAuthBits(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const enc = new TextEncoder()
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: AUTH_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    256,
  )
  return new Uint8Array(bits)
}

export async function hashPassword(password: string, salt?: Uint8Array) {
  const saltBytes = salt ?? crypto.getRandomValues(new Uint8Array(16))
  const hashBytes = await deriveAuthBits(password, saltBytes)
  return {
    hash: toBase64(hashBytes),
    salt: toBase64(saltBytes),
  }
}

export async function verifyPassword(
  password: string,
  saltB64: string,
  hashB64: string,
): Promise<boolean> {
  const salt = fromBase64(saltB64)
  const computed = await deriveAuthBits(password, salt)
  const expected = fromBase64(hashB64)
  if (computed.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < computed.length; i++) {
    diff |= computed[i] ^ expected[i]
  }
  return diff === 0
}

export { AUTH_ITERATIONS }
