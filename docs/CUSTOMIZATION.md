# Customization system

HabituAll is designed so that no single UI works for every brain. Customisation happens in **three layers**:

```
1. Behaviour profiles     src/profiles/profileConfig.ts     (ADHD, autism, …)
2. Personality traits     src/profiles/personalityTraits.ts (sliders + tags)
3. Display preferences    src/customization/                (theme, motion)
```

Layers 1 and 2 drive rewards, copy, cues, and activation thresholds. Layer 3 is visual only.

> **Note:** Profiles and personality inputs are UX starting points informed by research — not medical advice or diagnoses.

## Behaviour profiles

Combinable, set in onboarding step 1 and Settings. Merged via `mergeProfileBehaviour()`.

| ID | Intent |
|----|--------|
| `general` | Balanced defaults |
| `adhd` | Immediate feedback, tiny versions, low shame |
| `autism` | Predictability, advance change notice, next-up card |
| `anxiety` | Reassuring copy, graded steps, mood check-in |
| `depression` | Tiny steps, values tag emphasis, mood tracking |

Single source of truth: `src/profiles/profileConfig.ts`

## Personality traits

Optional layer set in onboarding step 2 (skippable) and **Settings → Personality & approach**.

| Input | Purpose |
|-------|---------|
| Five sliders (1–5) | Plain-language Big-Five-style self-report (planning, stress sensitivity, energy, change comfort, values) |
| Trait tags | e.g. "Small steps help me avoid overwhelm", "I can be hard on myself" |
| Custom notes | Free text for the user; stored but not parsed for behaviour |

Merged on top of profiles via `applyPersonalityAdaptation()` in `src/profiles/personalityTraits.ts`.

UI: `src/components/PersonalityTraitsEditor.tsx`

## Display preferences

Separate from behavioural adaptation. Schema:

```
UserPreferences
├── profileId          Which preset was chosen (or 'custom')
├── display            Visual theme, contrast, motion, density
├── cognitive          How much information is shown at once
├── interaction        Touch targets, confirmations, feedback style
├── habits             How habits are presented and tracked
├── reminders          Notification tone & caps (skeleton)
├── language           Copy tone and terminology
└── privacy            Local-only flags, sync opt-in (skeleton)
```

### Files

| File | Role |
|------|------|
| `src/customization/types.ts` | Full preference schema |
| `src/customization/defaults.ts` | Baseline defaults |
| `src/customization/presets.ts` | Profile presets (partial overrides) |
| `src/customization/mergePreferences.ts` | Deep-merge preset + user overrides |
| `src/customization/applyPreferences.ts` | Applies CSS variables & `data-*` attrs on `<html>` |
| `src/customization/PreferencesContext.tsx` | React context + localStorage persistence |

`applyPreferences(prefs)` sets CSS custom properties and `data-*` attributes. Components should read from `usePreferences()` for theme/motion.

## Personalisation (per-user)

Stored on `UserRecord.personalization` (not the customization context):

- Background image (data URL, max 2 MB)
- Overlay dim
- Motivational text + attribution

Settings → **Personalise**. Motivational text is subject to local content safety checks.

## Roadmap

- [x] Behaviour profiles (combinable)
- [x] Personality trait sliders + tags
- [ ] Research-backed copy variants per profile (partial — copy pools exist)
- [ ] Per-habit overrides (e.g. this habit uses micro-steps)
- [ ] Import/export preferences (encrypted)
- [ ] Server sync of preference blob inside user vault
