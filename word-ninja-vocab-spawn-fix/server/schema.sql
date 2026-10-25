CREATE TABLE IF NOT EXISTS wn_users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  username_key TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wn_username_key_lower CHECK (username_key = LOWER(username_key))
);

CREATE TABLE IF NOT EXISTS wn_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES wn_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS wn_sessions_user_id_idx ON wn_sessions(user_id);
CREATE INDEX IF NOT EXISTS wn_sessions_expiry_idx ON wn_sessions(expires_at);

CREATE TABLE IF NOT EXISTS wn_game_saves (
  user_id BIGINT PRIMARY KEY REFERENCES wn_users(id) ON DELETE CASCADE,
  state JSONB NOT NULL,
  rev BIGINT NOT NULL DEFAULT 1,
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wn_word_progress (
  user_id BIGINT PRIMARY KEY REFERENCES wn_users(id) ON DELETE CASCADE,
  words JSONB NOT NULL DEFAULT '{}'::jsonb,
  rev BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Server-managed English vocabulary. The old import script only had a raw list and
-- fabricated translations; this table stores CEFR and real dictionary metadata separately.
CREATE TABLE IF NOT EXISTS wn_vocab (
  id TEXT PRIMARY KEY,
  word TEXT NOT NULL,
  word_key TEXT NOT NULL UNIQUE,
  meaning_vi TEXT NOT NULL DEFAULT '',
  definition_en TEXT NOT NULL DEFAULT '',
  example_en TEXT NOT NULL DEFAULT '',
  example_vi TEXT NOT NULL DEFAULT '',
  ipa TEXT NOT NULL DEFAULT '',
  pos TEXT NOT NULL DEFAULT '',
  cefr_level TEXT NOT NULL DEFAULT 'A1' CHECK (cefr_level IN ('A1','A2','B1','B2','C1','C2')),
  cefr_source TEXT NOT NULL DEFAULT 'unknown',
  topic TEXT NOT NULL DEFAULT 'general',
  is_common BOOLEAN NOT NULL DEFAULT FALSE,
  battle_ready BOOLEAN NOT NULL DEFAULT FALSE,
  needs_manual_review BOOLEAN NOT NULL DEFAULT FALSE,
  alt_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  source TEXT NOT NULL DEFAULT 'unknown',
  -- Provenance for every Vietnamese gloss: exact headword/sense IDs and all distinct vi glosses
  -- observed on that English headword in the source SQLite dictionary.
  dictionary_word TEXT NOT NULL DEFAULT '',
  dictionary_word_id TEXT NOT NULL DEFAULT '',
  dictionary_sense_id TEXT NOT NULL DEFAULT '',
  dictionary_sense_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  dictionary_meanings_vi JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Safe in-place migration for databases created before CEFR provenance was tracked.
ALTER TABLE wn_vocab ADD COLUMN IF NOT EXISTS cefr_source TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE wn_vocab ADD COLUMN IF NOT EXISTS dictionary_word TEXT NOT NULL DEFAULT '';
ALTER TABLE wn_vocab ADD COLUMN IF NOT EXISTS dictionary_word_id TEXT NOT NULL DEFAULT '';
ALTER TABLE wn_vocab ADD COLUMN IF NOT EXISTS dictionary_sense_id TEXT NOT NULL DEFAULT '';
ALTER TABLE wn_vocab ADD COLUMN IF NOT EXISTS dictionary_sense_ids JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE wn_vocab ADD COLUMN IF NOT EXISTS dictionary_meanings_vi JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE wn_vocab ADD COLUMN IF NOT EXISTS needs_manual_review BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS wn_vocab_battle_cefr_idx ON wn_vocab(battle_ready, cefr_level);
CREATE INDEX IF NOT EXISTS wn_vocab_common_idx ON wn_vocab(is_common, battle_ready);
CREATE INDEX IF NOT EXISTS wn_vocab_dictionary_word_id_idx ON wn_vocab(dictionary_word_id);
CREATE INDEX IF NOT EXISTS wn_vocab_review_idx ON wn_vocab(needs_manual_review, battle_ready);

-- Active question state lives on the server so the browser never needs the answer up front.
CREATE TABLE IF NOT EXISTS wn_combat_sessions (
  user_id BIGINT PRIMARY KEY REFERENCES wn_users(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  rev BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
