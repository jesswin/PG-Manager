-- ============================================================
-- PG Manager — Supabase Database Schema
-- Run this in your Supabase project: Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Profiles (one per auth.user) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id       UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name     TEXT NOT NULL DEFAULT '',
  phone    TEXT NOT NULL DEFAULT '',
  email    TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PG Properties ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pgs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       TEXT NOT NULL,
  address    TEXT NOT NULL DEFAULT '',
  city       TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Rooms ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
  id          TEXT PRIMARY KEY,
  pg_id       UUID REFERENCES pgs(id) ON DELETE CASCADE NOT NULL,
  number      TEXT NOT NULL,
  floor       INTEGER NOT NULL DEFAULT 1,
  type        TEXT NOT NULL DEFAULT 'Single',
  status      TEXT NOT NULL DEFAULT 'Vacant',
  tenant_id   TEXT,
  tenant_name TEXT,
  rent_amount INTEGER NOT NULL DEFAULT 0,
  amenities   TEXT[] NOT NULL DEFAULT '{}'
);

-- ── Tenants ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
  id                 TEXT PRIMARY KEY,
  pg_id              UUID REFERENCES pgs(id) ON DELETE CASCADE NOT NULL,
  name               TEXT NOT NULL,
  phone              TEXT NOT NULL DEFAULT '',
  email              TEXT NOT NULL DEFAULT '',
  room_number        TEXT NOT NULL DEFAULT '',
  rent_amount        INTEGER NOT NULL DEFAULT 0,
  move_in_date       TEXT NOT NULL DEFAULT '',
  payment_status     TEXT NOT NULL DEFAULT 'Unpaid',
  avatar             TEXT NOT NULL DEFAULT '',
  emergency_contact  TEXT NOT NULL DEFAULT '',
  emergency_phone    TEXT NOT NULL DEFAULT '',
  id_proof_type      TEXT NOT NULL DEFAULT 'Aadhar',
  id_proof_number    TEXT NOT NULL DEFAULT '',
  occupation         TEXT NOT NULL DEFAULT '',
  rent_due_day       INTEGER NOT NULL DEFAULT 5,
  security_deposit   INTEGER NOT NULL DEFAULT 0,
  advance_paid       INTEGER NOT NULL DEFAULT 0,
  food_preference    TEXT NOT NULL DEFAULT 'No Preference',
  amenities          TEXT[] NOT NULL DEFAULT '{}',
  notes              TEXT NOT NULL DEFAULT '',
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ── Payments ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id           TEXT PRIMARY KEY,
  pg_id        UUID REFERENCES pgs(id) ON DELETE CASCADE NOT NULL,
  tenant_id    TEXT NOT NULL DEFAULT '',
  tenant_name  TEXT NOT NULL DEFAULT '',
  room_number  TEXT NOT NULL DEFAULT '',
  amount       INTEGER NOT NULL DEFAULT 0,
  due_date     TEXT NOT NULL DEFAULT '',
  paid_date    TEXT,
  status       TEXT NOT NULL DEFAULT 'Unpaid',
  month        TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Notices ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
  id           TEXT PRIMARY KEY,
  pg_id        UUID REFERENCES pgs(id) ON DELETE CASCADE NOT NULL,
  title        TEXT NOT NULL DEFAULT '',
  message      TEXT NOT NULL DEFAULT '',
  recipient    TEXT NOT NULL DEFAULT 'All Tenants',
  recipient_id TEXT,
  status       TEXT NOT NULL DEFAULT 'Draft',
  created_at   TEXT NOT NULL DEFAULT '',
  sent_at      TEXT
);

-- ============================================================
-- Row Level Security — each user only sees their own data
-- ============================================================

ALTER TABLE profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pgs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants   ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices   ENABLE ROW LEVEL SECURITY;

-- Profiles: only the owner
CREATE POLICY "owner_profile"   ON profiles FOR ALL USING (id = auth.uid());

-- PGs: only the owner
CREATE POLICY "owner_pgs"       ON pgs      FOR ALL USING (owner_id = auth.uid());

-- Everything else: must belong to one of the owner's PGs
CREATE POLICY "owner_rooms"     ON rooms    FOR ALL USING (pg_id IN (SELECT id FROM pgs WHERE owner_id = auth.uid()));
CREATE POLICY "owner_tenants"   ON tenants  FOR ALL USING (pg_id IN (SELECT id FROM pgs WHERE owner_id = auth.uid()));
CREATE POLICY "owner_payments"  ON payments FOR ALL USING (pg_id IN (SELECT id FROM pgs WHERE owner_id = auth.uid()));
CREATE POLICY "owner_notices"   ON notices  FOR ALL USING (pg_id IN (SELECT id FROM pgs WHERE owner_id = auth.uid()));

-- ── Owner Settings (UPI + notification prefs) ────────────────────────────────
CREATE TABLE IF NOT EXISTS owner_settings (
  owner_id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  upi_id                TEXT NOT NULL DEFAULT '',
  upi_name              TEXT NOT NULL DEFAULT '',
  notif_auto_send       BOOLEAN NOT NULL DEFAULT TRUE,
  notif_days_before_due INTEGER NOT NULL DEFAULT 3,
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE owner_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_settings" ON owner_settings FOR ALL USING (owner_id = auth.uid());

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
