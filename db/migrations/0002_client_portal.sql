ALTER TABLE bookings ADD COLUMN portal_token TEXT;

CREATE TABLE IF NOT EXISTS client_service_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL REFERENCES bookings(id),
  request_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  detail TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL REFERENCES bookings(id),
  amount INTEGER NOT NULL,
  payment_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'due',
  due_date TEXT NOT NULL,
  provider_reference TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS bookings_portal_token_idx ON bookings(portal_token);
CREATE INDEX IF NOT EXISTS service_requests_booking_idx ON client_service_requests(booking_id, created_at);
