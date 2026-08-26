ALTER TABLE bookings ADD COLUMN portal_pin_hash TEXT;

CREATE TABLE IF NOT EXISTS client_login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lookup_key TEXT NOT NULL,
  succeeded INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS client_login_attempts_idx
ON client_login_attempts(lookup_key, created_at);
