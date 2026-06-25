import { useState } from 'react'
import type { BehaviourProfileId } from '../domain/types'
import { useAuth } from '../auth/AuthContext'
import { useSessionCrypto } from '../auth/SessionCryptoContext'
import { ONBOARDING_PROFILE_OPTIONS } from '../profiles/profileConfig'
import { DEFAULT_PERSONALITY_TRAITS } from '../profiles/personalityTraits'
import { useAppStore } from '../store/AppStoreContext'
import { readImageAsDataUrl } from '../store/appData'
import { usePreferences } from '../customization/PreferencesContext'
import { useVault } from '../privacy/VaultContext'
import { PageHeader } from '../components/PageHeader'
import { PersonalityTraitsEditor } from '../components/PersonalityTraitsEditor'
import { SafetyBlockNotice } from '../components/SafetyBlockNotice'
import { SettingSection, SettingSelect, SettingToggle } from '../components/settings/SettingControls'
import { ANTI_STREAK_NOTICE } from '../copy/messages'

export function Settings() {
  const { data, setProfiles, setPersonalityTraits, updatePersonalization } = useAppStore()
  const { session, logout } = useAuth()
  const { lock: lockCrypto } = useSessionCrypto()
  const { preferences, updateSection } = usePreferences()
  const { state: vaultState, unlock, lock: lockVault } = useVault()
  const [passphrase, setPassphrase] = useState('')
  const [vaultMessage, setVaultMessage] = useState<string | null>(null)
  const [personalError, setPersonalError] = useState<string | null>(null)
  const [safetyError, setSafetyError] = useState<string | null>(null)

  const p = data.user.personalization
  const personality = data.user.personality ?? { ...DEFAULT_PERSONALITY_TRAITS }

  const toggleProfile = (id: BehaviourProfileId) => {
    const current: BehaviourProfileId[] = data.user.profiles.filter((p) => p !== 'general')
    const next = current.includes(id)
      ? current.filter((p) => p !== id)
      : [...current, id]
    setProfiles(next.length > 0 ? next : ['general'])
  }

  const handleUnlock = async () => {
    const result = await unlock(passphrase)
    if (result.status === 'error') setVaultMessage(result.message)
    else if (result.status === 'unlocked') {
      setVaultMessage('Vault unlocked.')
      setPassphrase('')
    }
  }

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPersonalError(null)
    try {
      const dataUrl = await readImageAsDataUrl(file)
      updatePersonalization({ backgroundImage: dataUrl })
    } catch (err) {
      setPersonalError(err instanceof Error ? err.message : 'Could not load image.')
    }
    e.target.value = ''
  }

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Profiles change rewards, copy, and cues. Display settings are separate."
      />

      <p className="mb-8 text-sm text-text-muted">{ANTI_STREAK_NOTICE}</p>

      <div className="space-y-10">
        <SettingSection
          title="Behaviour profiles"
          description="Combinable and non-diagnostic. Drives reward timing, copy, and cue handling."
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {ONBOARDING_PROFILE_OPTIONS.map((opt) => {
              const active = data.user.profiles.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleProfile(opt.id)}
                  className={`rounded-xl border p-4 text-left ${
                    active ? 'border-accent bg-accent/5' : 'border-border bg-surface-raised'
                  }`}
                >
                  <span className="block font-medium text-text">{opt.label}</span>
                  <span className="mt-1 block text-sm text-text-muted">{opt.description}</span>
                </button>
              )
            })}
          </div>
        </SettingSection>

        <SettingSection
          title="Personality & approach"
          description="Self-reported traits fine-tune cues, copy, and rewards — layered on top of behaviour profiles. Not a clinical test."
        >
          <PersonalityTraitsEditor
            value={personality}
            onChange={(traits) => {
              const err = setPersonalityTraits(traits)
              setSafetyError(err)
            }}
          />
          {safetyError && <SafetyBlockNotice message={safetyError} />}
        </SettingSection>

        <SettingSection title="Display">
          <SettingSelect
            label="Theme"
            value={preferences.display.theme}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'Match system' },
              { value: 'high_contrast', label: 'High contrast' },
              { value: 'muted', label: 'Muted / low stimulation' },
            ]}
            onChange={(theme) => updateSection('display', { theme })}
          />
          <SettingSelect
            label="Motion"
            value={preferences.display.motion}
            options={[
              { value: 'full', label: 'Full animations' },
              { value: 'reduced', label: 'Reduced motion' },
              { value: 'none', label: 'No motion' },
            ]}
            onChange={(motion) => updateSection('display', { motion })}
          />
          <SettingToggle
            label="Rounded corners"
            checked={preferences.display.roundedCorners}
            onChange={(roundedCorners) => updateSection('display', { roundedCorners })}
          />
        </SettingSection>

        <SettingSection
          title="Personalise"
          description="Your own background and words — any language. Stored on this device with your account."
        >
          <div className="rounded-xl border border-border bg-surface-raised p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text">Background image</label>
              <p className="mt-0.5 text-xs text-text-muted">JPG, PNG, or WebP, max 2 MB.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <label className="cursor-pointer rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-slate-50">
                  Upload image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={handleBackgroundUpload}
                  />
                </label>
                {p.backgroundImage && (
                  <button
                    type="button"
                    onClick={() => updatePersonalization({ backgroundImage: undefined })}
                    className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-text">
                Overlay darkness ({Math.round((p.backgroundDim ?? 0.45) * 100)}%)
              </span>
              <span className="mt-0.5 block text-xs text-text-muted">
                Keeps text readable over your photo.
              </span>
              <input
                type="range"
                min={0}
                max={0.85}
                step={0.05}
                value={p.backgroundDim ?? 0.45}
                onChange={(e) =>
                  updatePersonalization({ backgroundDim: parseFloat(e.target.value) })
                }
                className="mt-2 w-full"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text">Motivational line</span>
              <span className="mt-0.5 block text-xs text-text-muted">
                Shown on Home — your own quote, affirmation, or reminder (any language).
              </span>
              <textarea
                className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                rows={3}
                placeholder="e.g. One small step is enough for today."
                value={p.motivationalText ?? ''}
                onChange={(e) => {
                  const err = updatePersonalization({
                    motivationalText: e.target.value || undefined,
                  })
                  setSafetyError(err)
                }}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text">Attribution (optional)</span>
              <input
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                placeholder="e.g. You, or a name"
                value={p.motivationalAuthor ?? ''}
                onChange={(e) => {
                  const err = updatePersonalization({
                    motivationalAuthor: e.target.value || undefined,
                  })
                  setSafetyError(err)
                }}
              />
            </label>

            {personalError && (
              <p className="text-sm text-red-600">{personalError}</p>
            )}
          </div>
        </SettingSection>

        <SettingSection title="Account">
          <div className="rounded-xl border border-border bg-surface-raised p-4">
            <p className="text-sm text-text-muted">
              Signed in as{' '}
              <span className="font-medium text-text">{session?.username}</span>
            </p>
            <p className="mt-2 text-xs text-text-muted">
              Username + password only — no email, no social login. Data stays on this device until
              encrypted sync is enabled.
            </p>
            <button
              type="button"
              onClick={() => {
                lockCrypto()
                logout()
              }}
              className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </SettingSection>

        <SettingSection title="About">
          <div className="rounded-xl border border-border bg-surface-raised p-4 text-sm leading-relaxed text-text-muted">
            <p className="font-medium text-text">About the science behind this app</p>
            <p className="mt-2">
              This app&apos;s approach to building habits is informed by peer-reviewed research in
              behavioural psychology and cognitive neuroscience, including studies on habit
              automaticity, implementation intentions, and behavioural activation. Features adapt to
              a profile you select; these profiles are non-clinical UX settings, not a diagnosis or
              assessment, and the app is not a medical or mental-health treatment tool.
            </p>
            <p className="mt-2">
              If you&apos;re struggling with your mental health, please speak to a qualified
              professional.
            </p>
            <p className="mt-3 text-xs">
              Full bibliography, caveats, and DOIs → <strong>Research</strong> in the sidebar.
            </p>
          </div>
        </SettingSection>

        <SettingSection
          title="Privacy & encryption"
          description="Cloud sync will store ciphertext only. Keys never leave your device."
        >
          <div className="rounded-xl border border-border bg-surface-raised p-4">
            <p className="text-sm text-text-muted">
              Vault:{' '}
              <span className="font-medium text-text">
                {vaultState.status === 'unlocked' ? 'Unlocked' : 'Locked'}
              </span>
            </p>
            {vaultState.status !== 'unlocked' ? (
              <div className="mt-4 space-y-3">
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  placeholder="Vault passphrase"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={handleUnlock}
                  disabled={!passphrase}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Unlock vault
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={lockVault}
                className="mt-4 rounded-lg border border-border px-4 py-2 text-sm"
              >
                Lock vault
              </button>
            )}
            {vaultMessage && <p className="mt-3 text-sm text-text-muted">{vaultMessage}</p>}
          </div>
        </SettingSection>
      </div>
    </>
  )
}
