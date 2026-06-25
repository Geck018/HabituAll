-- Auth (username + password hash only — no email, no OAuth)
CREATE TABLE IF NOT EXISTS auth_users (
  username        TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL UNIQUE,
  password_hash   BLOB NOT NULL,
  salt            BLOB NOT NULL,
  created_at      TEXT NOT NULL
);

-- Cloudflare D1 schema (skeleton)
-- Server stores ONLY ciphertext. No habit names, notes, or health data in plaintext.

CREATE TABLE IF NOT EXISTS user_vaults (
  user_id     TEXT PRIMARY KEY,          -- opaque auth subject id
  blob_id     TEXT NOT NULL UNIQUE,
  ciphertext  BLOB NOT NULL,             -- AES-256-GCM encrypted vault JSON
  iv          BLOB NOT NULL,             -- 12-byte nonce
  version     INTEGER NOT NULL DEFAULT 1,
  updated_at  TEXT NOT NULL              -- ISO 8601
);

CREATE INDEX IF NOT EXISTS idx_user_vaults_updated ON user_vaults(updated_at);

-- Optional: sync metadata without content
CREATE TABLE IF NOT EXISTS vault_sync_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT NOT NULL,
  blob_id     TEXT NOT NULL,
  version     INTEGER NOT NULL,
  synced_at   TEXT NOT NULL
);
