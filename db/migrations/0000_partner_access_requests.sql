CREATE TABLE IF NOT EXISTS partner_access_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_count TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS partner_access_requests_status_created_idx
  ON partner_access_requests(status, created_at);
