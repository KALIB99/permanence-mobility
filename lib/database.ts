import { env } from "cloudflare:workers";

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS vehicles (
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
  )`,
  `CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS bookings (
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
  )`,
  `CREATE TABLE IF NOT EXISTS client_service_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    request_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    detail TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS payment_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    amount INTEGER NOT NULL,
    payment_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'due',
    due_date TEXT NOT NULL,
    provider_reference TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS client_login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lookup_key TEXT NOT NULL,
    succeeded INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS waiting_list (
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
  )`,
  `CREATE TABLE IF NOT EXISTS waitlist_offers (
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
  )`,
  `CREATE TABLE IF NOT EXISTS notification_events (
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
  )`,
  `CREATE INDEX IF NOT EXISTS bookings_vehicle_period_idx ON bookings(vehicle_id, start_date, end_date, status)`,
  `CREATE INDEX IF NOT EXISTS waiting_list_queue_idx ON waiting_list(status, created_at)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS active_vehicle_offer_idx ON waitlist_offers(vehicle_id) WHERE status = 'active'`,
  `CREATE INDEX IF NOT EXISTS service_requests_booking_idx ON client_service_requests(booking_id, created_at)`,
];

const seedStatements = [
  `INSERT OR IGNORE INTO vehicles
   (id, slug, make, model, year, category, weekly_price, deposit, mileage_allowance, features, eligibility, location, image_url, status)
   VALUES
   (1, '2023-toyota-camry-se', 'Toyota', 'Camry SE', 2023, 'Sedan', 399, 300, 1200, 'Apple CarPlay,Backup camera,Bluetooth,Adaptive cruise control', 'Uber,Lyft,DoorDash,Instacart', 'Phoenix, AZ', '/og.png', 'available')`,
  `INSERT OR IGNORE INTO vehicles
   (id, slug, make, model, year, category, weekly_price, deposit, mileage_allowance, features, eligibility, location, image_url, status)
   VALUES
   (2, '2022-honda-cr-v', 'Honda', 'CR-V', 2022, 'SUV', 449, 350, 1400, 'Apple CarPlay,Backup camera,Blind-spot monitor,Cargo space', 'Uber,Lyft,DoorDash,Amazon Flex', 'Phoenix, AZ', '/og.png', 'available')`,
  `INSERT OR IGNORE INTO vehicles
   (id, slug, make, model, year, category, weekly_price, deposit, mileage_allowance, features, eligibility, location, image_url, status)
   VALUES
   (3, '2023-hyundai-elantra-sel', 'Hyundai', 'Elantra SEL', 2023, 'Sedan', 379, 275, 1100, 'Wireless CarPlay,Lane assist,Backup camera,Excellent fuel economy', 'Uber,Lyft,DoorDash,Instacart', 'Phoenix, AZ', '/og.png', 'available')`,
];

let initialized = false;

export function database(): D1Database {
  if (!env.DB) throw new Error("Database binding is unavailable");
  return env.DB;
}

export async function ensureDatabase(): Promise<D1Database> {
  const db = database();
  if (!initialized) {
    for (const statement of schemaStatements) await db.prepare(statement).run();
    try {
      await db.prepare(`ALTER TABLE bookings ADD COLUMN portal_token TEXT`).run();
    } catch {
      // Existing databases already migrated to private portal access.
    }
    try {
      await db.prepare(`ALTER TABLE bookings ADD COLUMN portal_pin_hash TEXT`).run();
    } catch {
      // Existing databases already migrated to PIN-protected portal access.
    }
    try {
      await db.prepare(`ALTER TABLE bookings ADD COLUMN portal_password_hash TEXT`).run();
    } catch {
      // Existing databases already migrated to password-protected portal access.
    }
    for (const column of ["paid_at TEXT", "payment_method TEXT", "external_reference TEXT", "notes TEXT"]) {
      try {
        await db.prepare(`ALTER TABLE payment_records ADD COLUMN ${column}`).run();
      } catch {
        // Existing databases already contain the accounting column.
      }
    }
    await db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS bookings_portal_token_idx ON bookings(portal_token)`).run();
    await db.prepare(`CREATE INDEX IF NOT EXISTS client_login_attempts_idx ON client_login_attempts(lookup_key, created_at)`).run();
    await db.prepare(`CREATE INDEX IF NOT EXISTS payment_records_status_due_idx ON payment_records(status, due_date)`).run();
    for (const statement of seedStatements) await db.prepare(statement).run();
    initialized = true;
  }
  return db;
}

export async function expireStaleHolds(db = database()): Promise<void> {
  await db.prepare(
    `UPDATE bookings SET status = 'expired', updated_at = CURRENT_TIMESTAMP
     WHERE status = 'hold' AND hold_expires_at IS NOT NULL AND hold_expires_at <= CURRENT_TIMESTAMP`
  ).run();
  await db.prepare(
    `UPDATE vehicles SET status = 'available', updated_at = CURRENT_TIMESTAMP
     WHERE status = 'reserved'
       AND id NOT IN (
         SELECT vehicle_id FROM bookings
         WHERE status IN ('hold', 'confirmed') AND (hold_expires_at IS NULL OR hold_expires_at > CURRENT_TIMESTAMP)
       )`
  ).run();
}
