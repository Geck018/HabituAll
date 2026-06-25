# HabituAll



A habit tracker built for everyone — including people with ADHD, autism, anxiety, depression, and other conditions. **Automaticity, not streaks.** Privacy-first by design.



## Documentation



| Doc | What it's for |

|-----|----------------|

| **[CHANGELOG.md](CHANGELOG.md)** | Patch notes & version history |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System design, evidence base, data model, build phases |

| [docs/RESEARCH.md](docs/RESEARCH.md) | Full bibliography, disclaimers, caveats |

| [docs/PRODUCT.md](docs/PRODUCT.md) | Behavioural rules & anti-requirements |

| [docs/PRIVACY.md](docs/PRIVACY.md) | Encryption, auth, content safety |

| [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md) | Profiles, personality traits, display prefs |

| [src/research/sources.ts](src/research/sources.ts) | Canonical bibliography (powers in-app **Research**) |



Keep README, **CHANGELOG**, ARCHITECTURE, `.gitignore`, `sources.ts`, and `docs/RESEARCH.md` in sync when the system changes (see ARCHITECTURE §17).



## Product principles



- **No streak-shaming** — a missed day dips automaticity by ~1–2%, never resets progress

- **If-then habits** — anchored to cues (routine, time+place, event), not clock-time alone

- **Honest timelines** — ~2 months median to automaticity, highly variable (no "21 days")

- **Profile-adaptive** — combinable, non-diagnostic profiles tune rewards, copy, and cues

- **Personality-informed** — optional sliders + tags layer further tweaks on top of profiles

- **Evidence-informed** — mechanics grounded in cited research (see in-app Research page)

- **Encrypted at rest** — habit text ciphertext on device; key from your password

- **Local content safety** — blocks harmful replacement-behaviour text; quit-target field exempt

- **Zero-knowledge sync** (planned) — encrypted vault on Cloudflare



## Quick start



```bash

npm install

npm run dev      # http://localhost:5173

npm run build

```



**App flow:** Register/login → Unlock (password decrypts habits) → Onboarding → main app.



## What's working



| Feature | Status |

|---------|--------|

| Onboarding (profiles + optional personality) | ✅ |

| Local auth (username + password) + unlock | ✅ |

| Habit text encryption at rest (AES-256-GCM) | ✅ |

| Personalisation (background, motivational text) | ✅ |

| Personality traits (sliders, tags, adaptation) | ✅ |

| If-then habit builder + `leavingBehind` quit field | ✅ |

| Local content safety (device-only, no reporting) | ✅ |

| Automaticity engine (0–100 curve) | ✅ |

| Daily view + immediate rewards | ✅ |

| Mood-after prompt (depression/anxiety) | ✅ |

| Progress screen + automaticity curves | ✅ |

| Recovery / "Not today" flow | ✅ |

| Habit removal | ✅ |

| Research bibliography (sidebar) | ✅ |

| Encrypted vault blob skeleton | ✅ |

| Cue-based reminders | 🔜 |

| Cloudflare persistence | 🔜 |



## Project layout



```

src/

├── auth/            Username/password, session, data-key derivation

├── engine/          Automaticity math

├── profiles/        Behaviour profiles + personality adaptation

├── research/        Bibliography data (→ Research page)

├── safety/          Local content moderation (no network)

├── store/           App state (habits, completions, users)

├── copy/            Shame-free product copy

├── customization/   Display preferences (theme, motion)

├── privacy/         Habit encryption + vault skeleton

└── pages/           Auth, Unlock, Onboarding, Daily, Habits, Progress, Research, Settings



ARCHITECTURE.md      System reference (keep updated)

docs/                PRODUCT.md, PRIVACY.md, CUSTOMIZATION.md, RESEARCH.md

workers/             Cloudflare Worker (ciphertext only)

```



## License



MIT — see [LICENSE](LICENSE).

