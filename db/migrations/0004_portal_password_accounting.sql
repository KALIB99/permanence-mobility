ALTER TABLE bookings ADD COLUMN portal_password_hash TEXT;

ALTER TABLE payment_records ADD COLUMN paid_at TEXT;
ALTER TABLE payment_records ADD COLUMN payment_method TEXT;
ALTER TABLE payment_records ADD COLUMN external_reference TEXT;
ALTER TABLE payment_records ADD COLUMN notes TEXT;

CREATE INDEX IF NOT EXISTS payment_records_status_due_idx
ON payment_records(status, due_date);
