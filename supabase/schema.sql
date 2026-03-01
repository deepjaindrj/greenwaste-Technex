-- ============================================================
-- WasteOS — Full Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension (already available in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE portal_type AS ENUM ('citizen', 'municipal');
CREATE TYPE pickup_status AS ENUM ('Requested', 'Confirmed', 'En Route', 'Collecting', 'Complete', 'Cancelled');
CREATE TYPE waste_type AS ENUM ('Wet', 'Dry', 'Mixed', 'Hazardous');
CREATE TYPE truck_status AS ENUM ('Active', 'Idle', 'Delayed', 'Maintenance');
CREATE TYPE esg_buyer_status AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE report_status AS ENUM ('Generated', 'Processing', 'Scheduled', 'Failed');
CREATE TYPE alert_type AS ENUM ('overflow', 'segregation', 'delay', 'milestone');
CREATE TYPE impact_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE subscription_frequency AS ENUM ('Daily', 'Weekly', 'Monthly');

-- ============================================================
-- CORE TABLES
-- ============================================================

-- ----------------------------------------------------------
-- 1. PROFILES (extends Supabase auth.users)
--    One row per registered user (citizen or municipal officer)
-- ----------------------------------------------------------
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL DEFAULT '',
  phone         TEXT,
  portal        portal_type NOT NULL DEFAULT 'citizen',
  city          TEXT NOT NULL DEFAULT 'Indore',
  society       TEXT,                         -- citizen's apartment / society name
  ward          TEXT,                         -- municipal ward
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 2. ZONES  (city zones managed by municipal)
-- ----------------------------------------------------------
CREATE TABLE zones (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL UNIQUE,         -- e.g. 'Zone 1', 'Zone 4B'
  city          TEXT NOT NULL DEFAULT 'Indore',
  ward          TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 3. TRUCKS  (municipal fleet)
-- ----------------------------------------------------------
CREATE TABLE trucks (
  id            TEXT PRIMARY KEY,             -- e.g. 'MP-201'
  zone_id       UUID REFERENCES zones(id),
  status        truck_status NOT NULL DEFAULT 'Idle',
  collected_kg  NUMERIC(10,2) NOT NULL DEFAULT 0,
  driver_name   TEXT,
  driver_phone  TEXT,
  last_active   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 4. PICKUP REQUESTS  (citizen-initiated)
-- ----------------------------------------------------------
CREATE TABLE pickup_requests (
  id                TEXT PRIMARY KEY,         -- e.g. 'PKP-2026-0301-001'
  citizen_id        UUID NOT NULL REFERENCES profiles(id),
  status            pickup_status NOT NULL DEFAULT 'Requested',
  waste_type        waste_type NOT NULL DEFAULT 'Mixed',
  date              DATE NOT NULL,
  time_window       TEXT NOT NULL,            -- 'Morning 7–9am' | 'Afternoon 2–4pm'
  address           TEXT,
  whatsapp_opted    BOOLEAN NOT NULL DEFAULT FALSE,
  -- subscription
  is_subscription   BOOLEAN NOT NULL DEFAULT FALSE,
  frequency         subscription_frequency,
  -- assignment (filled by municipal)
  collector_id      UUID REFERENCES profiles(id),
  truck_id          TEXT REFERENCES trucks(id),
  eta_minutes       INTEGER,
  -- timestamps
  requested_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at      TIMESTAMPTZ,
  collected_at      TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 5. COLLECTION RECORDS  (scan results after pickup)
-- ----------------------------------------------------------
CREATE TABLE collection_records (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pickup_id         TEXT NOT NULL REFERENCES pickup_requests(id),
  citizen_id        UUID NOT NULL REFERENCES profiles(id),
  date              DATE NOT NULL,
  wet_kg            NUMERIC(6,2) NOT NULL DEFAULT 0,
  dry_kg            NUMERIC(6,2) NOT NULL DEFAULT 0,
  hazardous_kg      NUMERIC(6,2) NOT NULL DEFAULT 0,
  total_kg          NUMERIC(6,2) GENERATED ALWAYS AS (wet_kg + dry_kg + hazardous_kg) STORED,
  segregation_score INTEGER NOT NULL CHECK (segregation_score BETWEEN 0 AND 100),
  credits_earned    INTEGER NOT NULL DEFAULT 0,
  co2_saved_kg      NUMERIC(6,2) NOT NULL DEFAULT 0,
  scanned_by        UUID REFERENCES profiles(id),    -- collector who did the scan
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 6. CARBON WALLET  (aggregate per citizen, recomputed via triggers)
-- ----------------------------------------------------------
CREATE TABLE carbon_wallets (
  citizen_id        UUID PRIMARY KEY REFERENCES profiles(id),
  total_credits     INTEGER NOT NULL DEFAULT 0,
  wallet_balance    NUMERIC(10,2) NOT NULL DEFAULT 0,  -- ₹ cash value
  trees_saved       INTEGER NOT NULL DEFAULT 0,
  energy_saved_kwh  NUMERIC(10,2) NOT NULL DEFAULT 0,
  co2_saved_kg      NUMERIC(10,2) NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Monthly credit chart (one row per citizen per month)
CREATE TABLE carbon_wallet_monthly (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id        UUID NOT NULL REFERENCES profiles(id),
  month             TEXT NOT NULL,            -- 'Jan', 'Feb', …
  year              INTEGER NOT NULL,
  credits           INTEGER NOT NULL DEFAULT 0,
  UNIQUE (citizen_id, month, year)
);

-- ----------------------------------------------------------
-- 7. MARKETPLACE BRANDS  (global, seeded by admin)
-- ----------------------------------------------------------
CREATE TABLE marketplace_brands (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  category          TEXT NOT NULL,
  credits_required  INTEGER NOT NULL,
  cash_value        NUMERIC(8,2) NOT NULL,
  voucher_label     TEXT NOT NULL,
  logo_url          TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 8. VOUCHERS  (citizen redeemed vouchers)
-- ----------------------------------------------------------
CREATE TABLE vouchers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id        UUID NOT NULL REFERENCES profiles(id),
  brand_id          UUID NOT NULL REFERENCES marketplace_brands(id),
  code              TEXT NOT NULL UNIQUE,
  label             TEXT NOT NULL,
  credits_spent     INTEGER NOT NULL,
  cash_value        NUMERIC(8,2) NOT NULL,
  expires_at        DATE NOT NULL,
  used_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 9. LEADERBOARD (read-optimised view refresh helper)
--    Actual ranking is computed by view below; this table
--    caches monthly snapshots for charting trend sparklines.
-- ----------------------------------------------------------
CREATE TABLE leaderboard_history (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id        UUID NOT NULL REFERENCES profiles(id),
  month             TEXT NOT NULL,
  year              INTEGER NOT NULL,
  credits           INTEGER NOT NULL DEFAULT 0,
  rank              INTEGER,
  UNIQUE (citizen_id, month, year)
);

-- ----------------------------------------------------------
-- 10. MUNICIPAL PICKUP QUEUE  (live ops feed)
-- ----------------------------------------------------------
CREATE TABLE municipal_pickup_queue (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pickup_id         TEXT NOT NULL REFERENCES pickup_requests(id),
  city              TEXT NOT NULL DEFAULT 'Indore',
  assigned_truck_id TEXT REFERENCES trucks(id),
  display_time      TEXT,                     -- '8:15 AM'
  queued_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at       TIMESTAMPTZ
);

-- ----------------------------------------------------------
-- 11. MUNICIPAL ALERTS
-- ----------------------------------------------------------
CREATE TABLE municipal_alerts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city              TEXT NOT NULL DEFAULT 'Indore',
  type              alert_type NOT NULL,
  title             TEXT NOT NULL,
  location          TEXT,
  is_read           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 12. WASTE TIMELINE DATA  (city-level daily metrics)
-- ----------------------------------------------------------
CREATE TABLE waste_timeline (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city              TEXT NOT NULL DEFAULT 'Indore',
  recorded_date     DATE NOT NULL,
  day_label         TEXT NOT NULL,             -- 'Mon', 'Tue', …
  recyclable_kg     NUMERIC(10,2) NOT NULL DEFAULT 0,
  biodegradable_kg  NUMERIC(10,2) NOT NULL DEFAULT 0,
  hazardous_kg      NUMERIC(10,2) NOT NULL DEFAULT 0,
  mixed_kg          NUMERIC(10,2) NOT NULL DEFAULT 0,
  predicted_kg      NUMERIC(10,2),
  UNIQUE (city, recorded_date)
);

-- ----------------------------------------------------------
-- 13. ZONE FORECAST  (weekly tonnage forecast per zone)
-- ----------------------------------------------------------
CREATE TABLE zone_forecast (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id           UUID NOT NULL REFERENCES zones(id),
  week_start        DATE NOT NULL,
  mon_kg            NUMERIC(8,2) NOT NULL DEFAULT 0,
  tue_kg            NUMERIC(8,2) NOT NULL DEFAULT 0,
  wed_kg            NUMERIC(8,2) NOT NULL DEFAULT 0,
  thu_kg            NUMERIC(8,2) NOT NULL DEFAULT 0,
  fri_kg            NUMERIC(8,2) NOT NULL DEFAULT 0,
  sat_kg            NUMERIC(8,2) NOT NULL DEFAULT 0,
  sun_kg            NUMERIC(8,2) NOT NULL DEFAULT 0,
  UNIQUE (zone_id, week_start)
);

-- ----------------------------------------------------------
-- 14. AI PREDICTIONS / INSIGHTS
-- ----------------------------------------------------------
CREATE TABLE ai_predictions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city              TEXT NOT NULL DEFAULT 'Indore',
  text              TEXT NOT NULL,
  confidence        INTEGER NOT NULL CHECK (confidence BETWEEN 0 AND 100),
  impact            impact_level NOT NULL,
  action            TEXT,
  expires_at        DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 15. ESG CORPORATE BUYERS
-- ----------------------------------------------------------
CREATE TABLE esg_corporate_buyers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company           TEXT NOT NULL,
  city              TEXT NOT NULL DEFAULT 'Indore',
  credits_wanted    INTEGER NOT NULL,
  price_per_credit  NUMERIC(6,2) NOT NULL,
  total_value       NUMERIC(12,2) GENERATED ALWAYS AS (credits_wanted * price_per_credit) STORED,
  status            esg_buyer_status NOT NULL DEFAULT 'Pending',
  reviewed_by       UUID REFERENCES profiles(id),
  reviewed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 16. ESG TRANSACTIONS  (completed credit sales)
-- ----------------------------------------------------------
CREATE TABLE esg_transactions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id          UUID NOT NULL REFERENCES esg_corporate_buyers(id),
  city              TEXT NOT NULL DEFAULT 'Indore',
  credits_sold      INTEGER NOT NULL,
  price_per_credit  NUMERIC(6,2) NOT NULL,
  total_value       NUMERIC(12,2) GENERATED ALWAYS AS (credits_sold * price_per_credit) STORED,
  transacted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 17. REPORTS
-- ----------------------------------------------------------
CREATE TABLE reports (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  generated_by      UUID NOT NULL REFERENCES profiles(id),
  type              TEXT NOT NULL,            -- 'Citizen', 'Municipal', 'ESG', 'Carbon', 'Audit', 'Predictive'
  title             TEXT NOT NULL,
  period            TEXT NOT NULL,
  status            report_status NOT NULL DEFAULT 'Processing',
  download_url      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 18. SCAN SESSIONS  (each Scan page usage)
-- ----------------------------------------------------------
CREATE TABLE scan_sessions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id        UUID REFERENCES profiles(id),
  image_url         TEXT,
  segregation_score INTEGER CHECK (segregation_score BETWEEN 0 AND 100),
  co2_landfill_kg   NUMERIC(6,3),
  co2_recycled_kg   NUMERIC(6,3),
  recommendation    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Detected items inside each scan
CREATE TABLE scan_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id        UUID NOT NULL REFERENCES scan_sessions(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  category          TEXT NOT NULL,
  confidence        INTEGER NOT NULL CHECK (confidence BETWEEN 0 AND 100),
  co2_impact        TEXT,
  disposal_instruction TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX ON pickup_requests (citizen_id);
CREATE INDEX ON pickup_requests (status);
CREATE INDEX ON pickup_requests (date DESC);
CREATE INDEX ON collection_records (citizen_id);
CREATE INDEX ON collection_records (date DESC);
CREATE INDEX ON vouchers (citizen_id);
CREATE INDEX ON vouchers (expires_at);
CREATE INDEX ON municipal_alerts (city, created_at DESC);
CREATE INDEX ON waste_timeline (city, recorded_date DESC);
CREATE INDEX ON esg_corporate_buyers (city, status);
CREATE INDEX ON esg_transactions (city, transacted_at DESC);
CREATE INDEX ON scan_sessions (citizen_id, created_at DESC);
CREATE INDEX ON leaderboard_history (citizen_id, year, month);

-- ============================================================
-- VIEWS
-- ============================================================

-- Live leaderboard (top 100 per city by total credits)
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT
  p.id              AS citizen_id,
  p.full_name,
  p.society,
  p.city,
  COALESCE(w.total_credits, 0) AS total_credits,
  RANK() OVER (PARTITION BY p.city ORDER BY COALESCE(w.total_credits, 0) DESC) AS rank
FROM profiles p
LEFT JOIN carbon_wallets w ON w.citizen_id = p.id
WHERE p.portal = 'citizen';

-- City ESG revenue stats
CREATE OR REPLACE VIEW esg_revenue_stats AS
SELECT
  city,
  SUM(credits_sold)   AS credits_sold,
  SUM(total_value)    AS total_revenue,
  COUNT(DISTINCT b.id)::INT AS companies_paid
FROM esg_transactions t
JOIN esg_corporate_buyers b ON b.id = t.buyer_id
GROUP BY city;

-- ============================================================
-- TRIGGERS — auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_trucks_updated_at
  BEFORE UPDATE ON trucks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_pickup_requests_updated_at
  BEFORE UPDATE ON pickup_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_esg_buyers_updated_at
  BEFORE UPDATE ON esg_corporate_buyers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TRIGGER — auto-create carbon_wallet on new profile
-- ============================================================

CREATE OR REPLACE FUNCTION create_carbon_wallet()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.portal = 'citizen' THEN
    INSERT INTO carbon_wallets (citizen_id)
    VALUES (NEW.id)
    ON CONFLICT (citizen_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_wallet
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_carbon_wallet();

-- ============================================================
-- TRIGGER — auto-update wallet when a collection is recorded
-- ============================================================

CREATE OR REPLACE FUNCTION update_wallet_on_collection()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Update totals in carbon_wallets
  INSERT INTO carbon_wallets (citizen_id, total_credits, co2_saved_kg, trees_saved, energy_saved_kwh)
  VALUES (
    NEW.citizen_id,
    NEW.credits_earned,
    NEW.co2_saved_kg,
    FLOOR(NEW.co2_saved_kg / 22),         -- 1 tree ≈ 22 kg CO₂/year
    NEW.co2_saved_kg * 350                -- 1 kg CO₂ ≈ 350 Wh
  )
  ON CONFLICT (citizen_id) DO UPDATE
    SET total_credits    = carbon_wallets.total_credits + EXCLUDED.total_credits,
        co2_saved_kg     = carbon_wallets.co2_saved_kg  + EXCLUDED.co2_saved_kg,
        trees_saved      = carbon_wallets.trees_saved   + EXCLUDED.trees_saved,
        energy_saved_kwh = carbon_wallets.energy_saved_kwh + EXCLUDED.energy_saved_kwh,
        updated_at       = NOW();

  -- Upsert monthly chart row
  INSERT INTO carbon_wallet_monthly (citizen_id, month, year, credits)
  VALUES (
    NEW.citizen_id,
    TO_CHAR(NEW.date, 'Mon'),
    EXTRACT(YEAR FROM NEW.date)::INT,
    NEW.credits_earned
  )
  ON CONFLICT (citizen_id, month, year) DO UPDATE
    SET credits = carbon_wallet_monthly.credits + EXCLUDED.credits;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_wallet_on_collection
  AFTER INSERT ON collection_records
  FOR EACH ROW EXECUTE FUNCTION update_wallet_on_collection();

-- ============================================================
-- TRIGGER — auto-add pickup to municipal queue on INSERT
-- ============================================================

CREATE OR REPLACE FUNCTION enqueue_pickup()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO municipal_pickup_queue (pickup_id, city, display_time)
  VALUES (
    NEW.id,
    (SELECT city FROM profiles WHERE id = NEW.citizen_id),
    TO_CHAR(NOW(), 'HH12:MI AM')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enqueue_pickup
  AFTER INSERT ON pickup_requests
  FOR EACH ROW EXECUTE FUNCTION enqueue_pickup();

-- ============================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_requests         ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_records      ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_wallets          ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_wallet_monthly   ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers                ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_sessions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_items              ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE municipal_pickup_queue  ENABLE ROW LEVEL SECURITY;
ALTER TABLE municipal_alerts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_corporate_buyers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_transactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_history     ENABLE ROW LEVEL SECURITY;
-- Public/read-only tables (no RLS needed for reads):
ALTER TABLE zones                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE trucks                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_brands      ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_timeline          ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_forecast           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions          ENABLE ROW LEVEL SECURITY;

-- ---------- profiles ----------
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Municipal can view all citizen profiles in their city"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.portal = 'municipal'
        AND p.city = profiles.city
    )
  );

-- ---------- pickup_requests ----------
CREATE POLICY "Citizens can view own pickups"
  ON pickup_requests FOR SELECT USING (auth.uid() = citizen_id);

CREATE POLICY "Citizens can create pickups"
  ON pickup_requests FOR INSERT WITH CHECK (auth.uid() = citizen_id);

CREATE POLICY "Municipal can view all pickups"
  ON pickup_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.portal = 'municipal'
    )
  );

CREATE POLICY "Municipal can update pickups (assign trucks)"
  ON pickup_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.portal = 'municipal'
    )
  );

-- ---------- collection_records ----------
CREATE POLICY "Citizens can view own collections"
  ON collection_records FOR SELECT USING (auth.uid() = citizen_id);

CREATE POLICY "Municipal / collectors can insert collection records"
  ON collection_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.portal = 'municipal'
    )
  );

CREATE POLICY "Municipal can view all collection records"
  ON collection_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.portal = 'municipal'
    )
  );

-- ---------- carbon_wallets ----------
CREATE POLICY "Citizens can view own wallet"
  ON carbon_wallets FOR SELECT USING (auth.uid() = citizen_id);

CREATE POLICY "Citizens can update own wallet balance (cash out)"
  ON carbon_wallets FOR UPDATE USING (auth.uid() = citizen_id);

-- ---------- carbon_wallet_monthly ----------
CREATE POLICY "Citizens can view own monthly chart"
  ON carbon_wallet_monthly FOR SELECT USING (auth.uid() = citizen_id);

-- ---------- vouchers ----------
CREATE POLICY "Citizens can view own vouchers"
  ON vouchers FOR SELECT USING (auth.uid() = citizen_id);

CREATE POLICY "Citizens can insert vouchers (accept offer)"
  ON vouchers FOR INSERT WITH CHECK (auth.uid() = citizen_id);

-- ---------- scan_sessions ----------
CREATE POLICY "Citizens can view own scans"
  ON scan_sessions FOR SELECT USING (auth.uid() = citizen_id);

CREATE POLICY "Citizens can insert scans"
  ON scan_sessions FOR INSERT WITH CHECK (auth.uid() = citizen_id);

-- ---------- scan_items ----------
CREATE POLICY "Citizens can view their scan items"
  ON scan_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scan_sessions s
      WHERE s.id = scan_items.session_id AND s.citizen_id = auth.uid()
    )
  );

CREATE POLICY "Citizens can insert scan items"
  ON scan_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scan_sessions s
      WHERE s.id = scan_items.session_id AND s.citizen_id = auth.uid()
    )
  );

-- ---------- reports ----------
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT USING (auth.uid() = generated_by);

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT WITH CHECK (auth.uid() = generated_by);

-- ---------- municipal_pickup_queue ----------
CREATE POLICY "Municipal can view pickup queue"
  ON municipal_pickup_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.portal = 'municipal'
    )
  );

CREATE POLICY "Municipal can update (assign trucks)"
  ON municipal_pickup_queue FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.portal = 'municipal'
    )
  );

-- ---------- municipal_alerts ----------
CREATE POLICY "Municipal can view alerts"
  ON municipal_alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.portal = 'municipal'
    )
  );

-- ---------- esg_corporate_buyers ----------
CREATE POLICY "Municipal can manage ESG buyers"
  ON esg_corporate_buyers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.portal = 'municipal'
    )
  );

-- ---------- esg_transactions ----------
CREATE POLICY "Municipal can view ESG transactions"
  ON esg_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.portal = 'municipal'
    )
  );

-- ---------- leaderboard_history ----------
CREATE POLICY "Anyone logged in can view leaderboard history"
  ON leaderboard_history FOR SELECT USING (auth.uid() IS NOT NULL);

-- ---------- public / read-only tables ----------
CREATE POLICY "Anyone logged in can view zones"
  ON zones FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone logged in can view trucks"
  ON trucks FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone logged in can view marketplace brands"
  ON marketplace_brands FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone logged in can view waste timeline"
  ON waste_timeline FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone logged in can view zone forecast"
  ON zone_forecast FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone logged in can view AI predictions"
  ON ai_predictions FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================
-- SEED DATA  (mirrors mockData.ts)
-- ============================================================

-- Zones
INSERT INTO zones (id, name, city) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Zone 1', 'Indore'),
  ('00000000-0000-0000-0000-000000000002', 'Zone 2', 'Indore'),
  ('00000000-0000-0000-0000-000000000003', 'Zone 3', 'Indore'),
  ('00000000-0000-0000-0000-000000000004', 'Zone 4', 'Indore'),
  ('00000000-0000-0000-0000-000000000005', 'Zone 4B', 'Indore'),
  ('00000000-0000-0000-0000-000000000006', 'Zone 5', 'Indore'),
  ('00000000-0000-0000-0000-000000000007', 'Zone 6', 'Indore'),
  ('00000000-0000-0000-0000-000000000008', 'Zone 7', 'Indore'),
  ('00000000-0000-0000-0000-000000000009', 'Zone 7A', 'Indore');

-- Trucks
INSERT INTO trucks (id, zone_id, status, collected_kg, driver_name, driver_phone) VALUES
  ('MP-201', '00000000-0000-0000-0000-000000000001', 'Active',      4200, 'Amit Singh',   '+91 98765 43211'),
  ('MP-215', '00000000-0000-0000-0000-000000000003', 'Active',      3800, 'Rajesh Kumar', '+91 98765 43210'),
  ('MP-247', '00000000-0000-0000-0000-000000000004', 'Delayed',     2100, 'Ravi Sharma',  '+91 98765 43213'),
  ('MP-289', '00000000-0000-0000-0000-000000000007', 'Idle',           0, 'Sunil Verma',  '+91 98765 43214'),
  ('MP-302', '00000000-0000-0000-0000-000000000008', 'Active',      5100, 'Suresh Patil', '+91 98765 43212');

-- Marketplace Brands
INSERT INTO marketplace_brands (name, category, credits_required, cash_value, voucher_label) VALUES
  ('Swiggy',         'Food Delivery',   200, 500,  '₹500 Swiggy Voucher'),
  ('BigBasket',      'Groceries',       150, 400,  '₹400 off Groceries'),
  ('Urban Company',  'Home Services',   300, 750,  'Free Deep Clean'),
  ('Zepto',          'Quick Commerce',  100, 250,  '₹250 Zepto Cash'),
  ('Myntra',         'Fashion',         250, 600,  '₹600 off Fashion'),
  ('BookMyShow',     'Entertainment',   180, 450,  '2 Free Movie Tickets');

-- Waste Timeline (last 7 days)
INSERT INTO waste_timeline (city, recorded_date, day_label, recyclable_kg, biodegradable_kg, hazardous_kg, mixed_kg, predicted_kg) VALUES
  ('Indore', CURRENT_DATE - 6, 'Mon', 420, 310, 45, 180, 400),
  ('Indore', CURRENT_DATE - 5, 'Tue', 380, 290, 52, 160, 390),
  ('Indore', CURRENT_DATE - 4, 'Wed', 450, 340, 38, 200, 430),
  ('Indore', CURRENT_DATE - 3, 'Thu', 410, 320, 48, 175, 420),
  ('Indore', CURRENT_DATE - 2, 'Fri', 490, 360, 55, 210, 470),
  ('Indore', CURRENT_DATE - 1, 'Sat', 520, 380, 42, 230, 510),
  ('Indore', CURRENT_DATE,     'Sun', 440, 330, 35, 190, 450);

-- Zone Forecast
INSERT INTO zone_forecast (zone_id, week_start, mon_kg, tue_kg, wed_kg, thu_kg, fri_kg, sat_kg, sun_kg) VALUES
  ('00000000-0000-0000-0000-000000000001', DATE_TRUNC('week', CURRENT_DATE)::DATE, 45, 48, 52, 50, 58, 62, 40),
  ('00000000-0000-0000-0000-000000000002', DATE_TRUNC('week', CURRENT_DATE)::DATE, 38, 40, 42, 39, 45, 50, 35),
  ('00000000-0000-0000-0000-000000000003', DATE_TRUNC('week', CURRENT_DATE)::DATE, 55, 58, 60, 62, 70, 75, 48),
  ('00000000-0000-0000-0000-000000000004', DATE_TRUNC('week', CURRENT_DATE)::DATE, 42, 44, 48, 52, 65, 78, 38);

-- Municipal Alerts
INSERT INTO municipal_alerts (city, type, title, location) VALUES
  ('Indore', 'overflow',     'Overflow Alert — Zone 4B',      'Vijay Nagar'),
  ('Indore', 'segregation',  'Low Segregation — Ward 12',     'Rajwada'),
  ('Indore', 'delay',        'Route Delay — Truck MP-247',    'Palasia'),
  ('Indore', 'milestone',    'Milestone — Ward 3 hit 80%',    'Sapna Sangeeta'),
  ('Indore', 'overflow',     'Overflow Risk — Zone 7A',       'Scheme 78');

-- AI Predictions
INSERT INTO ai_predictions (city, text, confidence, impact, action) VALUES
  ('Indore', 'Zone 7 will generate 22% more plastic this weekend',       87, 'high',   'Schedule extra pickup'),
  ('Indore', 'Composting capacity in Ward 3 exceeded by Tuesday',        79, 'medium', 'Redirect to Ward 5 facility'),
  ('Indore', 'Diwali week expected 3x surge in mixed waste',             94, 'high',   'Pre-deploy 40 extra trucks'),
  ('Indore', 'Paper waste declining trend — down 12% over 30 days',     82, 'low',    'Adjust recycling center hours');

-- ESG Corporate Buyers
INSERT INTO esg_corporate_buyers (company, city, credits_wanted, price_per_credit, status) VALUES
  ('Tata Sustainability',  'Indore', 5000, 2.80, 'Pending'),
  ('Reliance Green',       'Indore', 3000, 2.50, 'Approved'),
  ('Infosys ESG Fund',     'Indore', 8000, 3.10, 'Pending'),
  ('Mahindra EcoLogic',    'Indore', 2000, 2.60, 'Pending'),
  ('Wipro Earthian',       'Indore', 4500, 2.90, 'Approved');

-- ESG Recent Transactions (using buyer IDs from above — use sub-selects)
INSERT INTO esg_transactions (buyer_id, city, credits_sold, price_per_credit, transacted_at)
VALUES
  ((SELECT id FROM esg_corporate_buyers WHERE company = 'Reliance Green'  LIMIT 1), 'Indore', 3000, 2.50, NOW() - INTERVAL '1 day'),
  ((SELECT id FROM esg_corporate_buyers WHERE company = 'Wipro Earthian'  LIMIT 1), 'Indore', 4500, 2.90, NOW() - INTERVAL '4 days'),
  ((SELECT id FROM esg_corporate_buyers WHERE company = 'Tata Sustainability' LIMIT 1), 'Indore', 2000, 2.70, NOW() - INTERVAL '9 days'),
  ((SELECT id FROM esg_corporate_buyers WHERE company = 'Mahindra EcoLogic'   LIMIT 1), 'Indore', 1500, 2.80, NOW() - INTERVAL '14 days');

-- ============================================================
-- HELPER FUNCTION — generate pickup request ID
-- ============================================================

CREATE OR REPLACE FUNCTION generate_pickup_id()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  seq_num INT;
BEGIN
  SELECT COALESCE(MAX(SPLIT_PART(id, '-', 4)::INT), 0) + 1
  INTO seq_num
  FROM pickup_requests
  WHERE id LIKE 'PKP-' || TO_CHAR(NOW(), 'YYYY-MMDD') || '-%';

  RETURN 'PKP-' || TO_CHAR(NOW(), 'YYYY-MMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
END;
$$;

-- ============================================================
-- REALTIME  (enable for live municipal queue & alerts)
-- ============================================================

-- Run these in Supabase Dashboard > Database > Replication
-- OR uncomment if your Supabase plan supports it via SQL:
--
-- ALTER PUBLICATION supabase_realtime ADD TABLE pickup_requests;
-- ALTER PUBLICATION supabase_realtime ADD TABLE municipal_pickup_queue;
-- ALTER PUBLICATION supabase_realtime ADD TABLE municipal_alerts;
-- ALTER PUBLICATION supabase_realtime ADD TABLE esg_corporate_buyers;

-- ============================================================
-- STORAGE BUCKET (for scan images & avatars)
-- ============================================================

-- Run in Supabase Dashboard > Storage, or via API:
-- Bucket name: wasteos-uploads
-- Policy: authenticated users can upload to their own folder

-- ============================================================
-- END OF SCHEMA
-- ============================================================
