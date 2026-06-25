# Privacy & encryption

HabituAll uses a **zero-knowledge** model: the server never sees plaintext personal data.

## Threat model (target)

| Actor | Can they read habit data? |
|-------|---------------------------|
| HabituAll operator / Cloudflare admin | **No** — only ciphertext |
| Network attacker (TLS broken aside) | **No** — payload is encrypted |
| User with correct password | **Yes** — on their device after unlock |
| User who forgot password | **No** — by design (no backdoor) |
| Someone with device access but no password | **Partial** — scores/dates only; habit text is ciphertext |

## Local auth & encryption (implemented)

```
Register/login
    → PBKDF2 password hash stored in habituall:account:{username}
    → dataSalt per account
Unlock (password)
    → deriveDataKey(password, dataSalt) → in-memory CryptoKey
    → decrypt habit secrets (AES-256-GCM per habit)
Sign out / lock
    → clear in-memory key; ciphertext remains on disk
```

### What is encrypted at rest

| Data | Storage | Encrypted? |
|------|---------|------------|
| Habit text (behaviour, cues, tiny version, values tag, leavingBehind) | `StoredHabit.secret` | ✅ AES-256-GCM |
| User personalization (background image, motivational text) | `habituall:app-data` JSON | ❌ (device-local; vault migration planned) |
| Password | `habituall:account:*` | Hashed (PBKDF2), not encrypted |
| Completions, automaticity scores | `habituall:app-data` JSON | ❌ metadata only |
| Display preferences | `habituall:preferences` | ❌ (non-sensitive) |

Key derivation: `src/auth/dataKey.ts` · Habit crypto: `src/privacy/habitCrypto.ts`

## Content safety (local only)

`src/safety/contentModeration.ts` runs pattern checks **before save**:

- No text is sent to a server or third party
- No reporting, logging, or moderation queue
- Replacement-behaviour fields are checked; `leavingBehind` (quit target) is **exempt** so recovery goals can be named honestly
- Blocks are enforced in the UI and in `AppStoreContext` mutations

## Planned sync data flow

```
┌─────────────┐     encrypt (AES-256-GCM)      ┌──────────────────┐
│   Browser   │ ─────────────────────────────► │ Cloudflare D1    │
│  Web Crypto │     ciphertext + nonce + ver   │ (ciphertext only)│
└─────────────┘                                └──────────────────┘
       ▲
       │ decrypt with key derived from passphrase (PBKDF2)
       │
   User vault (in-memory key while unlocked)
```

1. User creates a **passphrase** (not sent to server).
2. Client derives a **wrapping key** via PBKDF2-SHA256 (600k iterations, per-user salt).
3. All habits, notes, preferences, and journal entries are serialized to JSON and encrypted as a single **vault blob** (or sharded blobs later).
4. Sync uploads `{ userId, blobId, ciphertext, iv, version, updatedAt }` — no keys.
5. On login, client downloads ciphertext and decrypts locally.

## Implementation modules

| Module | Purpose |
|--------|---------|
| `src/auth/` | Local accounts, session, `dataKey` derivation |
| `src/privacy/habitCrypto.ts` | Per-habit encrypt/decrypt at rest |
| `src/privacy/crypto.ts` | `deriveKey`, `encrypt`, `decrypt` via Web Crypto API |
| `src/privacy/vault.ts` | Lock/unlock blob vault (skeleton) |
| `src/privacy/syncClient.ts` | HTTP client — ciphertext in/out only |
| `src/safety/contentModeration.ts` | Local harmful-content blocks |
| `workers/src/index.ts` | Worker stub — validates auth token, stores blobs |

## Database schema (D1)

Only opaque fields — see `workers/schema.sql`. No columns for habit names, diagnoses, or email in plaintext beyond what auth requires (auth layer TBD).

## localStorage keys

| Key | Contents |
|-----|----------|
| `habituall:session` | `{ username, userId }` |
| `habituall:account:{username}` | Password hash, salt, dataSalt |
| `habituall:app-data:{userId}` | User, encrypted habits, completions |
| `habituall:auth-index` | Usernames on this device |
| `habituall:preferences` | Display preferences |

## Production checklist

- [x] Per-habit encryption at rest with password-derived key
- [x] Local content safety (block only, no reporting)
- [ ] Move personalization inside encrypted vault blob
- [ ] Passphrase strength guidance + optional recovery kit (user-held key export)
- [ ] Argon2id via WASM if we outgrow PBKDF2
- [ ] Blob versioning & conflict resolution
- [ ] Audit: ensure no analytics leak content
- [ ] Security review before public launch

## Cloudflare deployment (planned)

- **Pages** — static frontend from `dist/`
- **Worker** — `/api/vault` PUT/GET for encrypted blobs
- **D1** — `user_vaults` table
- Secrets via `wrangler secret` — never in repo
