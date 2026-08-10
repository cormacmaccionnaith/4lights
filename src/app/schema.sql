-- The Four Lights — application schema. Idempotent: safe to run on every boot.

CREATE TABLE IF NOT EXISTS users (
  id              BIGSERIAL PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'swimmer' CHECK (role IN ('swimmer','admin')),
  full_name       TEXT NOT NULL DEFAULT '',
  phone           TEXT NOT NULL DEFAULT '',
  address_line1   TEXT NOT NULL DEFAULT '',
  address_line2   TEXT NOT NULL DEFAULT '',
  city            TEXT NOT NULL DEFAULT '',
  county          TEXT NOT NULL DEFAULT '',
  postcode        TEXT NOT NULL DEFAULT '',
  country         TEXT NOT NULL DEFAULT 'Ireland',
  email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  verify_token    TEXT,
  reset_token     TEXT,
  reset_expires   TIMESTAMPTZ,
  series_completed     BOOLEAN NOT NULL DEFAULT FALSE,
  series_completed_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS swim_entries (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  swim_slug   TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'aspiring'
              CHECK (status IN ('aspiring','organised','completed','accredited')),
  swim_date   DATE,
  direction   TEXT NOT NULL DEFAULT '',
  route_note  TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, swim_slug)
);

CREATE TABLE IF NOT EXISTS documents (
  id            BIGSERIAL PRIMARY KEY,
  entry_id      BIGINT NOT NULL REFERENCES swim_entries(id) ON DELETE CASCADE,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stored_name   TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  size_bytes    BIGINT NOT NULL,
  kind          TEXT NOT NULL DEFAULT 'accreditation'
                CHECK (kind IN ('accreditation','route')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lightweight audit trail for admin review / status history.
CREATE TABLE IF NOT EXISTS entry_events (
  id             BIGSERIAL PRIMARY KEY,
  entry_id       BIGINT NOT NULL REFERENCES swim_entries(id) ON DELETE CASCADE,
  actor_user_id  BIGINT REFERENCES users(id) ON DELETE SET NULL,
  type           TEXT NOT NULL,
  note           TEXT NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Editable marketing copy: overrides layered over the src/content defaults.
CREATE TABLE IF NOT EXISTS content_overrides (
  path        TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  BIGINT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_entries_user ON swim_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_status ON swim_entries(status);
CREATE INDEX IF NOT EXISTS idx_documents_entry ON documents(entry_id);
CREATE INDEX IF NOT EXISTS idx_events_entry ON entry_events(entry_id);
