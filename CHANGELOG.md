# Changelog

All notable changes to **HabituAll** — habit tracking built on automaticity, not streaks.

Format inspired by [Keep a Changelog](https://keepachangelog.com/). Versions follow [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Planned
- Cue-based reminders (not clock-only)
- Graded change introduction when editing habits
- Cloudflare Workers + D1 encrypted vault sync
- Move personalization fields inside encrypted vault blob
- Encrypt motivational text / background metadata in vault

---

## [0.3.0] — 2025-06-25

*Privacy, personality, and platform safety.*

### Added
- **Local auth** — username + password only (no email, no OAuth). Usernames auto-generated as `colour-animal-number` (e.g. `violet-eagle-50`).
- **Unlock screen** — password derives an in-memory data key; habits decrypt only while unlocked.
- **Habit encryption at rest** — behaviour, cues, tiny version, values tag, and quit-target text stored as AES-256-GCM ciphertext per habit (`StoredHabit.secret`). Plain metadata: id, scores, colour, dates.
- **Personalisation** — custom background image (max 2 MB), overlay dim, motivational line + attribution (Settings → Personalise).
- **Personality traits layer** — onboarding step 2 (skippable) + Settings: five self-report sliders, six plain-language trait tags, optional notes. Adapts cues, copy, and rewards on top of behaviour profiles (`applyPersonalityAdaptation`).
- **“What I'm moving away from”** — optional `leavingBehind` field on habits for naming the old habit or urge being replaced. Encrypted; **not** content-filtered so recovery goals can be honest.
- **Local content safety** — pattern checks on replacement-behaviour fields before save. No server calls, no reporting, no logging. Crisis-line pointers on self-harm blocks in moderated fields.
- **Habit removal** — delete habits (and their completion history) from All habits.
- **Sign out from Unlock** — escape hatch if session exists but unlock fails.
- **Research** — Roberts et al. 2014 (conscientiousness scaffolding) added to bibliography.

### Changed
- Onboarding is now **two steps**: behaviour profiles → optional personality traits.
- Habit creation copy clarifies which fields are safety-checked vs exempt.
- `ARCHITECTURE.md`, `README.md`, and all `docs/` files synced to current implementation (v0.3).

### Fixed
- **Unlock for legacy accounts** — accounts created before `dataSalt` backfill on unlock/login instead of showing a dead-end error.
- **PersonalizationBackground crash** — old user data without `personalization` normalised on load.
- **Password hashing** — auth uses `deriveBits`; vault `deriveKey` kept separate (not exportable for auth).
- **Settings `lock` name clash** — vault `lock` vs crypto `lock` renamed to `lockVault` / `lockCrypto`.

### Security
- Content safety enforced in UI **and** store mutations (`addHabit`, `updatePersonalization`, `setPersonalityTraits`, onboarding).
- Safety checks run only on device; flagged text never leaves the browser.

---

## [0.2.0] — 2025-06

*Core product — automaticity engine and profile-adaptive UX.*

### Added
- **Automaticity engine** (`0–100` asymptotic curve) — completion closes 12% of gap to 100; tiny version at 70%; miss dips ~1.5 pts; **never resets to zero**.
- **If-then habit builder** — cue types: anchor (preferred), time+place, event; tiny version; optional values tag.
- **Combinable behaviour profiles** — general, ADHD, autism, anxiety, depression. Non-diagnostic UX settings merged via `mergeProfileBehaviour()`.
- **Onboarding** — profile selection with anti-streak notice.
- **Today view** — one-tap complete, immediate profile-tuned reward feedback, “Not today” skip, recovery prompts.
- **Next up card** — predictability focus for autism profile.
- **Mood-after prompt** — depression/anxiety profiles; action→mood link on Progress.
- **Progress screen** — automaticity per habit, honest timeline copy (~2 months median, no “21 days”).
- **Research page** — full bibliography from `src/research/sources.ts` with disclaimers and caveats.
- **Display preferences** — theme, motion, rounded corners (`src/customization/`).
- **Shame-free copy** — resume-focused messages; no streak language (`src/copy/messages.ts`).
- **Habit privacy notice** on habit creation.
- **Workers skeleton** — `workers/` D1 schema + vault API stub (ciphertext only).
- **Documentation** — `ARCHITECTURE.md`, `docs/PRODUCT.md`, `docs/PRIVACY.md`, `docs/RESEARCH.md`, `docs/CUSTOMIZATION.md`.

### Changed
- Product positioning: **automaticity, not streaks** — streak counter deliberately absent.

---

## [0.1.0] — 2025-06

*Initial scaffold.*

### Added
- React 19 + Vite 7 + TypeScript + Tailwind CSS v4 project scaffold.
- Mobile-first responsive layout with sidebar navigation.
- Page routing: Dashboard, Habits, Habit create, Progress, Research, Settings.
- `AppStoreContext` with `localStorage` persistence (`habituall:app-data`).
- Domain types mirroring planned D1 schema (`src/domain/types.ts`).
- MIT license, `.gitignore`, `README.md`.

---

## Version ↔ architecture doc

| App version | `ARCHITECTURE.md` status | `package.json` |
|-------------|--------------------------|----------------|
| 0.3.0 | v0.3 | Bump to `0.3.0` when tagging a release |
| 0.2.0 | v0.2 (implicit) | — |
| 0.1.0 | initial | `0.1.0` |

When shipping a release: update this file → bump `package.json` → align `ARCHITECTURE.md` status line → tag in git.
