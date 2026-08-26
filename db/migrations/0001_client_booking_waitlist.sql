CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  category TEXT NOT NULL,
  weekly_price INTEGER NOT NULL,
  deposit INTEGER NOT NULL,
  mileage_allowance INTEGER NOT NULL,
  features TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
  client_id INTEGER NOT NULL REFERENCES clients(id),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  weeks INTEGER NOT NULL,
  weekly_price INTEGER NOT NULL,
  deposit INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'hold',
  hold_expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS waiting_list (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  location TEXT NOT NULL,
  preferred_vehicle_type TEXT NOT NULL,
  weekly_budget INTEGER NOT NULL,
  desired_start_date TEXT NOT NULL,
  approved_platforms TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS waitlist_offers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT NOT NULL UNIQUE,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
  waiting_list_id INTEGER NOT NULL REFERENCES waiting_list(id),
  status TEXT NOT NULL DEFAULT 'active',
  response_deadline TEXT NOT NULL,
  responded_at TEXT,
  booking_id INTEGER REFERENCES bookings(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  offer_id INTEGER REFERENCES waitlist_offers(id),
  waiting_list_id INTEGER REFERENCES waiting_list(id),
  channel TEXT NOT NULL,
  recipient TEXT NOT NULL,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL,
  provider_id TEXT,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS bookings_vehicle_period_idx ON bookings(vehicle_id, start_date, end_date, status);
CREATE INDEX IF NOT EXISTS waiting_list_queue_idx ON waiting_list(status, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS active_vehicle_offer_idx ON waitlist_offers(vehicle_id) WHERE status = 'active';
