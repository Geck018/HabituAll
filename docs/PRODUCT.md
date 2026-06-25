# Product spec — behavioural rules

These rules **are** the product. Implementation lives in `src/engine/`, `src/profiles/`, `src/copy/`, and `src/safety/`.

## Non-negotiables

| Rule | Implementation |
|------|----------------|
| No streak-shaming | No streak counter. `automaticity_score` dips ~1.5% on miss, never resets. |
| Honest timelines | No "21 days". Copy references ~2 months median, 18–254+ day range (Lally 2010). |
| If-then cues | Habit creation requires cue type + anchor/time/event + behaviour + tiny version. |
| Immediate reward | `RewardFeedback` on completion, tuned per profile + personality config. |
| Offload executive function | App holds reminders, breakdowns, next-step, progress (reminders: planned). |
| Quit honestly | Optional `leavingBehind` field names the old habit/urge — not content-filtered. |
| Safe replacement behaviours | `behaviour`, cues, tiny version are locally safety-checked before save. |

## Anti-requirements (do NOT build)

- Streaks that reset to 0 on a single miss
- Fixed-day promises
- Guilt/shame copy after a missed day
- Surprise UI/layout changes (autism profile: predictable UI)
- "Shake up your routine" for autism profile
- Distant-only rewards without immediate completion feedback
- Server-side reporting of flagged user text (safety is local block-only)

## Automaticity math

See `src/engine/automaticity.ts`:

- **Completion:** `newScore = score + (100 - score) * rate` (rate = 0.12, or 0.084 for tiny version)
- **Miss:** `newScore = max(0, score - 1.5)`

## Profile & personality config

| Layer | File | Role |
|-------|------|------|
| Behaviour profiles | `src/profiles/profileConfig.ts` | ADHD, autism, etc. — merged via `mergeProfileBehaviour()` |
| Personality traits | `src/profiles/personalityTraits.ts` | Sliders + tags — layered via `applyPersonalityAdaptation()` |
| Display prefs | `src/customization/` | Theme, motion — separate from behaviour |

Profiles and personality traits are combinable and non-diagnostic.

## Content safety

See `src/safety/contentModeration.ts`:

- Runs **only on device** — no network, no logging, no reporting
- Checks replacement-behaviour fields (`behaviour`, cues, `tinyVersion`, `valuesTag`, motivational text, personality notes)
- **`leavingBehind` is exempt** — users must be able to name difficult habits they're quitting
- Blocks include crisis-line pointers for self-harm wording in moderated fields

## Data model

```
users(id, profiles[], personality?, personalization, onboarding_complete)
habits(id, user_id, secret{ciphertext,iv}, automaticity_score, color, dates)  -- text encrypted
completions(id, habit_id, completed_at, mood_after?, automaticity_after)
```

Decrypted habit shape includes: `behaviour`, `cueType`, `cueAnchor`, `tinyVersion`, `valuesTag`, `leavingBehind?`.

Stored locally in `localStorage` (`habituall:app-data:{userId}`) per account.

## Build status

- [x] Onboarding (profiles + optional personality step)
- [x] Local auth + unlock + per-habit encryption
- [x] If-then habit builder + `leavingBehind`
- [x] Automaticity engine
- [x] Daily view + profile/personality-tuned rewards + mood prompt
- [x] Progress screen (automaticity curves, mood chart)
- [x] Recovery flow ("Not today" + resume prompt)
- [x] Habit removal
- [x] Local content safety
- [x] Research bibliography UI (`src/research/sources.ts`)
- [ ] Cue-based reminders (not clock-only)
- [ ] Graded change introduction for habit edits
- [ ] Cloudflare D1 persistence inside encrypted vault

Evidence citations: [ARCHITECTURE.md](../ARCHITECTURE.md) §2 · in-app **Research** page · `src/research/sources.ts`
