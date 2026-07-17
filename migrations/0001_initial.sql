PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password_hash TEXT,
  oauth_provider TEXT,
  oauth_id TEXT,
  avatar_url TEXT,
  username TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS oauth_unique
  ON users (oauth_provider, oauth_id);

CREATE TABLE IF NOT EXISTS saved_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  api_key_enc TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'openai',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS saved_configs_user_id_idx
  ON saved_configs (user_id);

CREATE TABLE IF NOT EXISTS check_histories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  config_id INTEGER REFERENCES saved_configs(id) ON DELETE SET NULL,
  config_name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  total INTEGER NOT NULL,
  success INTEGER NOT NULL,
  failed INTEGER NOT NULL,
  results_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS check_histories_user_created_idx
  ON check_histories (user_id, created_at DESC);
