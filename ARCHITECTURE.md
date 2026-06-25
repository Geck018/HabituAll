# System Design — Adaptive Habit App

**Status:** v0.3 — aligned with current implementation (see §17 for doc sync)
**Type:** Architecture / system reference for the repo

**Related docs:** [README.md](README.md) (quick start & status) · [docs/PRODUCT.md](docs/PRODUCT.md) (behavioural rules) · [src/research/sources.ts](src/research/sources.ts) (living bibliography, rendered in-app)

---

## 1. Purpose

A habit-building app whose differentiator is that habit-formation logic **adapts to the user's self-selected neurocognitive profile** (ADHD, autism, depression, anxiety, general). Every mechanic is grounded in peer-reviewed behaviour-change research, not the usual "streak + 21 days" pattern, which the evidence contradicts.

This document is the source of truth for *why* the system behaves the way it does. If a feature decision conflicts with Section 3 (Behavioural Principles), the principle wins.

---

## 2. Evidence base (the "why" behind the mechanics)

> **Living bibliography:** canonical list in [`src/research/sources.ts`](src/research/sources.ts) (in-app **Research** page). Prose reference: [`docs/RESEARCH.md`](docs/RESEARCH.md). Keep §2, both files, and the Research UI in sync.

| Design decision | Grounded in |
|---|---|
| No streak resets on a single miss | Lally 2010; 2024 Healthcare systematic review (~2,601 ppl); minimal miss dip in engine |
| Automaticity curve, not day-counter | Lally 2010; Buabang et al. 2024; Gardner 2024; Wood 2022 — asymptotic growth, median ~59–66 days |
| If-then cue builder | Gollwitzer & Sheeran 2006 (d≈0.65); Sheeran et al. 2024 (642 tests); MCII meta 2021 |
| Immediate completion reward | Tripp & Wickens 2008; delay-discounting ADHD literature — distant rewards under-register |
| Digital habit design | Zhu et al. 2024 (JMIR) — self-monitoring, cues, goal setting |
| ADHD executive offloading | JCM 2024 EF review; Liang 2021; exercise NMA — external structure over willpower |
| Behavioural Activation | Alber 2023; Jia 2025; Yisma 2025; BA meta 2023 — mood tracking, maintenance caveat |
| Predictability + transitions (autism) | Cooper & Russell 2025; Spackman 2023; transition review 2015 |
| Personality-informed UX | Gardner 2024; Roberts et al. 2014 (conscientiousness scaffolding); Wood & Neal — sliders + tags layer on profiles |

**To add a source:** edit `src/research/sources.ts` → mirror a one-line summary here → verify in the Research UI.

---

## 3. Behavioural principles (non-negotiable)

These are product invariants, not preferences.

1. **No streak-shaming.** A miss never resets progress to zero. Automaticity dips minimally and resumes.
2. **Cues over clocks.** Habits anchor to an existing routine / event / place, expressed as "After I X, I will Y."
3. **Honest timelines.** No fixed-day promises. Progress = automaticity, not days elapsed.
4. **Offload executive function.** The app holds reminders, breakdowns, next-step. Never lean on user willpower/working memory.
5. **Shrink the action→reward gap.** Reward lands immediately on completion, tuned per profile.

---

## 4. Architecture overview

Local-first, with optional encrypted sync backend.

```
┌──────────────────────────────────────────────┐
│  Client (React + Vite + TS + Tailwind)        │
│                                               │
│  Auth → Unlock → AppStoreProvider             │
│                                               │
│  ┌────────────┐  ┌──────────────────────────┐ │
│  │ pages/     │  │ domain/ + engine/        │ │
│  │ components │  │  - automaticity.ts       │ │
│  │            │  │  - profiles/profileConfig│ │
│  │            │  │  - profiles/personality  │ │
│  │            │  │  - copy/messages.ts      │ │
│  └────────────┘  └──────────────────────────┘ │
│         │        ┌──────────────────────────┐ │
│         │        │ store/AppStoreContext    │ │
│         ▼        │  (habits, completions)   │ │
│  ┌─────────────────────────────────────────┐ │
│  │ persistence (MVP)                       │ │
│  │  - localStorage: habituall:app-data     │ │
│  │  - habit text: AES-256-GCM per habit    │ │
│  │  - auth: habituall:account:* + session  │ │
│  │  - privacy/vault.ts (blob skeleton)     │ │
│  └─────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────┐ │
│  │ safety/contentModeration.ts (local only)│ │
│  └─────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────┘
                            │ (optional, ciphertext only)
                            ▼
        ┌───────────────────────────────────┐
        │ Cloudflare Worker (workers/)      │
        │  - GET/PUT /api/vault             │
        │  - D1: user_vaults (ciphertext)   │
        └───────────────────────────────────┘
```

**App flow:** `Auth` (register/login) → `Unlock` (derive data key from password) → main app. Session persists in `localStorage`; encryption key stays in memory until sign-out.

**Implemented paths:**

| Layer | Location |
|---|---|
| Automaticity engine | `src/engine/automaticity.ts` |
| Profile behaviour config | `src/profiles/profileConfig.ts` |
| Personality adaptation | `src/profiles/personalityTraits.ts` |
| App state | `src/store/AppStoreContext.tsx` |
| Auth (local) | `src/auth/` — username + PBKDF2 password + session crypto |
| Display preferences | `src/customization/` |
| Research bibliography | `src/research/sources.ts` → `pages/Research.tsx` |
| Habit encryption | `src/privacy/habitCrypto.ts` |
| Content safety (local) | `src/safety/contentModeration.ts` |
| Vault blob (skeleton) | `src/privacy/vault.ts` |

**Design rule:** the domain layer (engine + profile config) is platform-agnostic and persistence-agnostic. Persistence sits behind an interface so the MVP can ship local-only and add sync later without touching domain logic.

---

## 5. Tech stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind v4, mobile-first.
- **Local persistence (MVP):** `localStorage` — per-user app data (`habituall:app-data:{userId}`), accounts (`habituall:account:*`), session (`habituall:session`). Habit names/cues encrypted at rest via `habitCrypto.ts`; key derived from password + `dataSalt`.
- **Planned local persistence:** IndexedDB via a thin adapter (Dexie or hand-rolled).
- **Optional backend:** Cloudflare Workers + D1 — ciphertext-only vault sync (`workers/`). See [docs/PRIVACY.md](docs/PRIVACY.md).
- **Secrets:** `.env` / `.dev.vars` — never committed (see [.gitignore](.gitignore)).

---

## 6. Data model

### TypeScript (as implemented in `src/domain/types.ts`)

```ts
type Profile = "adhd" | "autism" | "depression" | "anxiety" | "general";
type CueType = "anchor" | "time_place" | "event";

interface User {
  id: string;
  username: string;
  profiles: Profile[];
  personality?: PersonalityTraits;  // Big-Five-style sliders + plain-language tags
  onboardingComplete: boolean;
  createdAt: string;
  personalization: {
    backgroundImage?: string;
    backgroundDim?: number;
    motivationalText?: string;
    motivationalAuthor?: string;
  };
}

interface PersonalityTraits {
  openness: number;           // 1–5 self-report, 3 = typical
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  tags: PersonalityTraitTagId[];
  customNotes?: string;
  configured: boolean;
}

interface Habit {
  id: string;
  userId: string;
  behaviour: string;          // replacement behaviour — content-safety checked
  cueType: CueType;
  cueAnchor: string;
  cueTime?: string;           // time_place
  cuePlace?: string;          // time_place
  cueEvent?: string;          // event
  tinyVersion: string;
  valuesTag?: string;
  leavingBehind?: string;     // old habit/urge being quit — NOT safety-filtered
  automaticityScore: number;  // 0–100
  color: string;
  createdAt: string;
  lastCompletedDate?: string;
  lastMissProcessedDate?: string;
  pendingChange?: HabitChangeNotice;  // advance notice (autism)
}

interface Completion {
  id: string;
  habitId: string;
  completedAt: string;
  usedTinyVersion: boolean;
  moodAfter?: number;         // 1–5; BA / anxiety profiles
  automaticityAfter: number;
}
```

`scheduleRule` and server-side plaintext D1 tables are **not** in the MVP — habits sync inside the encrypted vault blob when Cloudflare sync ships.

**On disk:** habit sensitive fields live in `StoredHabit.secret` (ciphertext + iv). Plain metadata: id, scores, colour, dates.

### SQL (D1 / SQLite)

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  profiles TEXT NOT NULL,        -- JSON array
  tone_pref TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE habits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  behaviour TEXT NOT NULL,
  cue_type TEXT NOT NULL,
  cue_anchor TEXT NOT NULL,
  tiny_version TEXT NOT NULL,
  values_tag TEXT,
  automaticity_score REAL NOT NULL DEFAULT 0,
  schedule_rule TEXT NOT NULL,
  created_at TEXT NOT NULL,
  archived_at TEXT
);

CREATE TABLE completions (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES habits(id),
  completed_at TEXT NOT NULL,
  used_tiny_version INTEGER NOT NULL DEFAULT 0,
  mood_after INTEGER
);

CREATE INDEX idx_habits_user ON habits(user_id);
CREATE INDEX idx_completions_habit ON completions(habit_id);
```

---

## 7. The automaticity engine (the differentiator — spec carefully)

Replaces streaks as the primary progress metric. Models Lally's asymptotic curve: large early gains, diminishing returns, minimal decay on a miss, **never a reset**.

### Update rules (implemented in `src/engine/automaticity.ts`)

```ts
const COMPLETION_RATE = 0.12;       // asymptotic: closes 12% of gap to 100 per completion
const TINY_VERSION_MULTIPLIER = 0.7; // tiny version still counts, smaller gain
const MISS_DIP_POINTS = 1.5;        // ~1–2%; never resets to zero

/** On completion: score + (100 - score) * rate */
function automaticityOnComplete(score: number, usedTinyVersion: boolean): number;

/** On miss: max(0, score - MISS_DIP_POINTS) */
function automaticityOnMiss(score: number): number;
```

**Planned (not yet coded):** cue-stability and complexity modifiers from Wood / Lally (see commented sketch below).

### Tiers (for UI messaging — no day promises)

| Score | Tier | UI message tone |
|---|---|---|
| 0–30 | Forming | "Early days — keep showing up." |
| 30–70 | Strengthening | "This is becoming automatic." |
| 70–100 | Established | "Largely on autopilot now." |

### Notes
- Decay applies only on a *missed scheduled opportunity*, not on every non-completion day.
- Using the tiny version still counts as a completion (lower friction is the point).
- Expose the math in code comments; it's the product's core IP.

---

## 8. Profile system (adaptive config)

All profile differences live in **one config object** — [`src/profiles/profileConfig.ts`](src/profiles/profileConfig.ts) — merged via `mergeProfileBehaviour()`. **Personality traits** ([`src/profiles/personalityTraits.ts`](src/profiles/personalityTraits.ts)) layer on top via `applyPersonalityAdaptation()` after profile merge. Profiles modify reward timing, copy, and change-handling; the automaticity engine is identical for all.

Display-only preferences (theme, motion) remain in `src/customization/` and are separate from behavioural profiles.

```ts
interface ProfileConfig {
  rewardStyle: "instant_visible" | "completion_values" | "predictability" | "small_wins";
  rewardFrequency: "every_action" | "on_completion";
  changeHandling: "standard" | "graded_optin" | "advance_warning";
  startFriction: "lowest" | "low" | "standard";
  copyTone: User["tonePref"];
  showTransitionCards: boolean;   // autism: "next up"
  trackMoodAfter: boolean;        // depression/anxiety: action→mood link
  allowSurpriseUI: false;         // global: always false
}
```

| Profile | rewardStyle | changeHandling | startFriction | mood | transition cards |
|---|---|---|---|---|---|
| ADHD | instant_visible | standard | lowest | – | – |
| Depression | completion_values | advance_warning | lowest | ✓ | – |
| Autism | predictability | graded_optin | standard | – | ✓ |
| Anxiety | small_wins | advance_warning | low | ✓ | – |
| General | completion_values | standard | standard | – | – |

Multiple profiles → merge to the most supportive setting (lowest friction, most warning, mood on if any profile wants it).

---

## 9. Feature modules

1. **Onboarding** — step 1: profile selection → step 2: optional personality traits (skippable).
2. **Habit creation (if-then builder)** — behaviour + cue + tiny version + optional values tag + optional `leavingBehind` (quit target).
3. **Daily view** — today's cued habits, one-tap complete, profile-tuned reward feedback, "next up" card (autism).
4. **Automaticity engine** — Section 7.
5. **Progress** — automaticity curves, honest timeline copy, action→mood chart where enabled. Streak count is NOT the hero metric.
6. **Habit management** — list all habits, remove habit (+ completion history).
7. **Change/transition handling** — advance notice of any change; graded change for autism.
8. **Recovery flow** — post-miss low-shame "resume" prompt; never punitive.
9. **Content safety** — local pattern checks on replacement-behaviour fields; `leavingBehind` exempt so users can name what they're quitting.

---

## 10. Key flows

**Onboarding:** select profile(s) → optional personality sliders/tags → derive merged behaviour config → first habit.

**Habit creation:** pick behaviour → choose cue type → name anchor → define tiny version → (optional) values tag → (optional) `leavingBehind` → save with `automaticityScore = 0`. Replacement fields are safety-checked; quit-target field is not.

**Completion:** tap complete → write `Completion` → `onCompletion()` updates score → profile-tuned reward animation → (if enabled) prompt mood-after.

**Missed opportunity:** scheduler detects missed cue → `onMiss()` (minimal dip) → surface gentle resume prompt next session. No reset, no guilt copy.

---

## 11. API surface (optional sync backend)

```
POST /v1/sync           # push local changes (habits, completions)
GET  /v1/sync?since=ts  # pull remote changes
POST /v1/auth/...       # auth (provider TBD)
```

Sync is last-write-wins per record for MVP. Engine never runs server-side; the server is dumb storage.

---

## 12. Privacy & data handling

This app stores **self-identified mental-health-adjacent data** (profile selection, mood logs). Treat it as sensitive.

- **Local-first by default.** Sync is opt-in; an offline-only user's data never leaves the device.
- **Habit text encrypted at rest** on device (AES-256-GCM). Without password, only anonymous metadata (scores, dates) is readable.
- **Local content safety** (`src/safety/`) — pattern checks on replacement-behaviour text before save. No reporting, no server calls. `leavingBehind` exempt so recovery/quit goals can be named honestly.
- **POPIA / GDPR posture:** minimal collection, clear purpose, export + delete-all available from settings, no third-party analytics on mood/profile data.
- **No diagnosis.** Profiles and personality sliders are user-selected, non-clinical labels that tune UX. Copy must never imply diagnosis or treatment.
- **Not a crisis tool.** Safety blocks include crisis-line pointers for self-harm wording in *replacement* fields; the app does not attempt assessment or intervention.
- Encrypt the sync payload in transit (TLS) and at-rest on D1 (ciphertext only).

---

## 13. Accessibility (tied to the target users)

- **Respect `prefers-reduced-motion`**; reward animations must have a calm variant.
- **No surprise UI/layout shifts** — `allowSurpriseUI` is globally false (autism profile depends on it).
- **Plain, literal language**; avoid idiom-heavy copy.
- **Low cognitive load:** one primary action per screen, clear "next up," minimal choices in the daily view.
- High-contrast theme + scalable text.

---

## 14. Anti-requirements (do NOT build)

- ❌ Streaks that reset to 0 on a single miss
- ❌ "21 days to a new you" / fixed-day promises
- ❌ Guilt/shame copy after a miss
- ❌ Surprise UI/layout changes
- ❌ "Shake up your routine" prompts for the autism profile
- ❌ Distant-only rewards with no immediate completion feedback
- ❌ Diagnosis language or clinical claims

---

## 15. Build phases

| Phase | Deliverable | Status |
|---|---|---|
| 0 | Scaffold (Vite + TS + Tailwind), routing | ✅ |
| 1 | Onboarding + ProfileConfig store | ✅ |
| 2 | Habit creation if-then builder | ✅ |
| 3 | **Automaticity engine** | ✅ |
| 4 | Daily view + completion + profile-tuned reward | ✅ |
| 5 | Progress screen with automaticity curves | ✅ |
| 6 | Recovery/resume + change-handling + transition cards | ✅ partial (resume + next-up; graded change planned) |
| 7 | Privacy/accessibility pass + Research bibliography UI | ✅ partial |
| 7b | Local auth + unlock + habit encryption at rest | ✅ |
| 7c | Personalisation (background, motivational text) | ✅ |
| 7d | Personality traits layer (onboarding step 2 + Settings) | ✅ |
| 7e | Local content safety + `leavingBehind` quit field | ✅ |
| 7f | Habit removal | ✅ |
| 8 | Cue-based reminders (not clock-only) | 🔜 |
| 9 | (Optional) Workers + D1 encrypted vault sync + server auth | 🔜 skeleton only |

---

## 16. Open decisions

- Auth provider for sync (or stay anonymous/local-only for MVP?)
- Learning-rate + decay constants need empirical tuning once there's usage data.
- How to detect "cue stability" automatically vs. ask the user.
- Multi-profile merge edge cases (conflicting tones).

---

## 17. Documentation maintenance

Keep these files aligned when the system changes:

| File | Purpose | Update when… |
|---|---|---|
| [CHANGELOG.md](CHANGELOG.md) | Patch notes & release history | Every user-facing release |
| [README.md](README.md) | Onboarding devs, feature status table | New user-facing feature ships or stack changes |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design & evidence rationale | Architecture, data model, or principles change |
| [.gitignore](.gitignore) | Files that must not be committed | New secrets, build dirs, local data exports |
| [docs/RESEARCH.md](docs/RESEARCH.md) | Full bibliography & disclaimers | New research source added |
| [src/research/sources.ts](src/research/sources.ts) | Canonical bibliography (in-app) | New research source added |
| [docs/PRODUCT.md](docs/PRODUCT.md) | Behavioural rules checklist | Product invariants change |
| [docs/PRIVACY.md](docs/PRIVACY.md) | Encryption & Cloudflare model | Sync/auth implementation changes |
| [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md) | Display prefs + personality layer | Customisation architecture changes |
| `src/safety/contentModeration.ts` | Local content safety rules | Safety patterns or exempt fields change |

**Research workflow:** add entry to `sources.ts` → add one-line row to §2 above → confirm Research page in app → set `verified: true` once DOI/URL confirmed.
