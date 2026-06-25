import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useSessionCrypto } from '../auth/SessionCryptoContext'

export function Unlock() {
  const { session, logout } = useAuth()
  const { unlock, lock } = useSessionCrypto()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return
    setError(null)
    setBusy(true)
    const err = await unlock(session.username, password)
    setBusy(false)
    if (err) setError(err)
  }

  const handleSignOut = () => {
    lock()
    logout()
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-text">Unlock your habits</h1>
          <p className="mt-2 text-sm text-text-muted">
            Habit names, cues, and notes are encrypted. Enter your password to decrypt them on
            this device.
          </p>
          {session && (
            <p className="mt-2 text-sm font-medium text-text">{session.username}</p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-border bg-surface-raised p-6"
        >
          <label className="block">
            <span className="text-sm font-medium text-text">Password</span>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !password}
            className="w-full rounded-lg bg-accent py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? 'Unlocking…' : 'Unlock'}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-center">
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm font-medium text-accent hover:underline"
          >
            Sign out and use a different account
          </button>
          <p className="text-xs text-text-muted">
            Without your password, stored habits are anonymous ciphertext — not readable by anyone.
          </p>
        </div>
      </div>
    </div>
  )
}
