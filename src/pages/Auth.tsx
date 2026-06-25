import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useSessionCrypto } from '../auth/SessionCryptoContext'
import { contentSafetyError } from '../safety/contentModeration'
import { isValidPassword, isValidUsername, normalizeUsername } from '../auth/usernameGenerator'

type AuthMode = 'login' | 'register'

export function Auth() {
  const { login, register, suggestUsername, regenerateUsername } = useAuth()
  const { unlock } = useSessionCrypto()
  const [mode, setMode] = useState<AuthMode>('register')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (mode === 'register' && !username) {
      setUsername(suggestUsername())
    }
  }, [mode, suggestUsername, username])

  const handleRegenerate = () => {
    setUsername(regenerateUsername())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const normalized = normalizeUsername(username)
    if (!isValidUsername(normalized)) {
      setError('Username needs at least 3 characters (letters, numbers, hyphens).')
      return
    }
    const usernameSafety = contentSafetyError(normalized)
    if (usernameSafety) {
      setError(usernameSafety)
      return
    }
    if (!isValidPassword(password)) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setBusy(true)
    const err =
      mode === 'login'
        ? await login(normalized, password)
        : await register(normalized, password)

    if (err) {
      setBusy(false)
      setError(err)
      return
    }

    const unlockErr = await unlock(normalized, password)
    setBusy(false)

    if (unlockErr) setError(unlockErr)
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-accent text-white">
            <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text">HabituAll</h1>
          <p className="mt-2 text-sm text-text-muted">
            {mode === 'register'
              ? 'Create a local account — username only, no email or social login.'
              : 'Sign in to your account on this device.'}
          </p>
        </div>

        <div className="mb-6 flex rounded-lg border border-border bg-surface-raised p-1">
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setError(null)
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium ${
              mode === 'register' ? 'bg-accent text-white' : 'text-text-muted'
            }`}
          >
            Create account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setError(null)
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium ${
              mode === 'login' ? 'bg-accent text-white' : 'text-text-muted'
            }`}
          >
            Sign in
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-surface-raised p-6">
          <label className="block">
            <span className="text-sm font-medium text-text">Username</span>
            <p className="mt-0.5 text-xs text-text-muted">
              Random suggestion — edit or regenerate. Used only to sign in; not linked to your identity.
            </p>
            <div className="mt-2 flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                value={username}
                onChange={(e) => setUsername(normalizeUsername(e.target.value))}
                autoComplete="username"
                required
              />
              {mode === 'register' && (
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-medium text-text hover:bg-slate-50"
                  title="Regenerate username"
                >
                  ↻
                </button>
              )}
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-text">Password</span>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              required
              minLength={8}
            />
          </label>

          {mode === 'register' && (
            <label className="block">
              <span className="text-sm font-medium text-text">Confirm password</span>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </label>
          )}

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-accent py-3 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {busy ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-text-muted">
          Accounts are stored on this device for now. Cloud sync will use the same username and an
          encrypted vault — no email, no third-party login.
        </p>
      </div>
    </div>
  )
}
