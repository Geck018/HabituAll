import type { UserPreferences } from './types'

const ACCENT_MAP: Record<string, { accent: string; hover: string }> = {
  indigo: { accent: '#4f46e5', hover: '#4338ca' },
  teal: { accent: '#0d9488', hover: '#0f766e' },
  rose: { accent: '#e11d48', hover: '#be123c' },
  amber: { accent: '#d97706', hover: '#b45309' },
  slate: { accent: '#475569', hover: '#334155' },
}

const THEME_SURFACES: Record<string, { surface: string; raised: string; text: string; muted: string; border: string }> = {
  light: {
    surface: '#f8fafc',
    raised: '#ffffff',
    text: '#0f172a',
    muted: '#64748b',
    border: '#e2e8f0',
  },
  dark: {
    surface: '#0f172a',
    raised: '#1e293b',
    text: '#f1f5f9',
    muted: '#94a3b8',
    border: '#334155',
  },
  high_contrast: {
    surface: '#000000',
    raised: '#0a0a0a',
    text: '#ffffff',
    muted: '#d4d4d4',
    border: '#ffffff',
  },
  muted: {
    surface: '#f5f5f4',
    raised: '#fafaf9',
    text: '#44403c',
    muted: '#78716c',
    border: '#e7e5e4',
  },
}

const DENSITY_SPACING: Record<string, string> = {
  compact: '0.85',
  comfortable: '1',
  spacious: '1.2',
}

export function applyPreferences(prefs: UserPreferences) {
  const root = document.documentElement

  const themeKey =
    prefs.display.theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : prefs.display.theme === 'muted'
        ? 'muted'
        : prefs.display.theme

  const surfaces = THEME_SURFACES[themeKey] ?? THEME_SURFACES.light
  const accent =
    prefs.display.colorScheme === 'custom' && prefs.display.customAccent
      ? { accent: prefs.display.customAccent, hover: prefs.display.customAccent }
      : ACCENT_MAP[prefs.display.colorScheme] ?? ACCENT_MAP.indigo

  root.style.setProperty('--color-surface', surfaces.surface)
  root.style.setProperty('--color-surface-raised', surfaces.raised)
  root.style.setProperty('--color-text', surfaces.text)
  root.style.setProperty('--color-text-muted', surfaces.muted)
  root.style.setProperty('--color-border', surfaces.border)
  root.style.setProperty('--color-accent', accent.accent)
  root.style.setProperty('--color-accent-hover', accent.hover)
  root.style.setProperty('--ha-font-scale', String(prefs.display.fontScale))
  root.style.setProperty('--ha-spacing-scale', DENSITY_SPACING[prefs.display.density] ?? '1')

  root.dataset.theme = themeKey
  root.dataset.density = prefs.display.density
  root.dataset.motion = prefs.display.motion
  root.dataset.profile = prefs.profileId
  root.dataset.largeTargets = String(prefs.interaction.largeTouchTargets)
  root.dataset.rounded = String(prefs.display.roundedCorners)

  if (prefs.display.motion === 'reduced' || prefs.display.motion === 'none') {
    root.style.setProperty('--ha-motion', '0')
  } else {
    root.style.setProperty('--ha-motion', '1')
  }
}
