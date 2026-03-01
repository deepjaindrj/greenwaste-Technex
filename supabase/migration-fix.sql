-- ============================================================
-- WasteOS — RLS Fix for Demo (run in Supabase SQL Editor)
-- Makes policies permissive so portal switching works.
-- Also adds helper for truck-driver workflow.
-- SAFE TO RUN MULTIPLE TIMES (fully idempotent).
-- ============================================================

-- ── PROFILES ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Municipal can view all citizen profiles in their city" ON profiles;
DROP POLICY IF EXISTS "Authenticated can view all profiles" ON profiles;
CREATE POLICY "Authenticated can view all profiles"
  ON profiles FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- INSERT — needed for bootstrap (upsert creates profile row)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated can insert profiles" ON profiles;
CREATE POLICY "Authenticated can insert profiles"
  ON profiles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── PICKUP REQUESTS ──────────────────────────────────────────
DROP POLICY IF EXISTS "Citizens can view own pickups" ON pickup_requests;
DROP POLICY IF EXISTS "Municipal can view all pickups" ON pickup_requests;
DROP POLICY IF EXISTS "Municipal can update pickups (assign trucks)" ON pickup_requests;
DROP POLICY IF EXISTS "Authenticated can view all pickups" ON pickup_requests;
DROP POLICY IF EXISTS "Authenticated can update pickups" ON pickup_requests;
DROP POLICY IF EXISTS "Citizens can create pickups" ON pickup_requests;
DROP POLICY IF EXISTS "Authenticated can create pickups" ON pickup_requests;
CREATE POLICY "Authenticated can view all pickups"
  ON pickup_requests FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update pickups"
  ON pickup_requests FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can create pickups"
  ON pickup_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── COLLECTION RECORDS ───────────────────────────────────────
DROP POLICY IF EXISTS "Citizens can view own collections" ON collection_records;
DROP POLICY IF EXISTS "Municipal / collectors can insert collection records" ON collection_records;
DROP POLICY IF EXISTS "Municipal can view all collection records" ON collection_records;
DROP POLICY IF EXISTS "Authenticated can view collections" ON collection_records;
DROP POLICY IF EXISTS "Authenticated can insert collections" ON collection_records;
CREATE POLICY "Authenticated can view collections"
  ON collection_records FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can insert collections"
  ON collection_records FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── CARBON WALLETS ───────────────────────────────────────────
DROP POLICY IF EXISTS "Citizens can view own wallet" ON carbon_wallets;
DROP POLICY IF EXISTS "Citizens can update own wallet balance (cash out)" ON carbon_wallets;
DROP POLICY IF EXISTS "Authenticated can view wallets" ON carbon_wallets;
DROP POLICY IF EXISTS "Authenticated can update wallets" ON carbon_wallets;
CREATE POLICY "Authenticated can view wallets"
  ON carbon_wallets FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update wallets"
  ON carbon_wallets FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ── CARBON WALLET MONTHLY ────────────────────────────────────
DROP POLICY IF EXISTS "Citizens can view own monthly chart" ON carbon_wallet_monthly;
DROP POLICY IF EXISTS "Authenticated can view monthly chart" ON carbon_wallet_monthly;
CREATE POLICY "Authenticated can view monthly chart"
  ON carbon_wallet_monthly FOR SELECT USING (auth.uid() IS NOT NULL);

-- ── VOUCHERS ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Citizens can view own vouchers" ON vouchers;
DROP POLICY IF EXISTS "Citizens can insert vouchers (accept offer)" ON vouchers;
DROP POLICY IF EXISTS "Authenticated can view vouchers" ON vouchers;
DROP POLICY IF EXISTS "Authenticated can insert vouchers" ON vouchers;
CREATE POLICY "Authenticated can view vouchers"
  ON vouchers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can insert vouchers"
  ON vouchers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── MUNICIPAL PICKUP QUEUE ───────────────────────────────────
DROP POLICY IF EXISTS "Municipal can view pickup queue" ON municipal_pickup_queue;
DROP POLICY IF EXISTS "Municipal can update (assign trucks)" ON municipal_pickup_queue;
DROP POLICY IF EXISTS "Authenticated can view queue" ON municipal_pickup_queue;
DROP POLICY IF EXISTS "Authenticated can update queue" ON municipal_pickup_queue;
DROP POLICY IF EXISTS "Allow queue insert" ON municipal_pickup_queue;
CREATE POLICY "Authenticated can view queue"
  ON municipal_pickup_queue FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update queue"
  ON municipal_pickup_queue FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow queue insert"
  ON municipal_pickup_queue FOR INSERT WITH CHECK (true);

-- ── MUNICIPAL ALERTS ─────────────────────────────────────────
DROP POLICY IF EXISTS "Municipal can view alerts" ON municipal_alerts;
DROP POLICY IF EXISTS "Authenticated can view alerts" ON municipal_alerts;
CREATE POLICY "Authenticated can view alerts"
  ON municipal_alerts FOR SELECT USING (auth.uid() IS NOT NULL);

-- ── ESG CORPORATE BUYERS ─────────────────────────────────────
DROP POLICY IF EXISTS "Municipal can manage ESG buyers" ON esg_corporate_buyers;
DROP POLICY IF EXISTS "Authenticated can manage ESG buyers" ON esg_corporate_buyers;
CREATE POLICY "Authenticated can manage ESG buyers"
  ON esg_corporate_buyers FOR ALL USING (auth.uid() IS NOT NULL);

-- ── ESG TRANSACTIONS ─────────────────────────────────────────
DROP POLICY IF EXISTS "Municipal can view ESG transactions" ON esg_transactions;
DROP POLICY IF EXISTS "Authenticated can view ESG transactions" ON esg_transactions;
CREATE POLICY "Authenticated can view ESG transactions"
  ON esg_transactions FOR SELECT USING (auth.uid() IS NOT NULL);

-- ── REPORTS ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Users can create reports" ON reports;
DROP POLICY IF EXISTS "Authenticated can view reports" ON reports;
DROP POLICY IF EXISTS "Authenticated can create reports" ON reports;
CREATE POLICY "Authenticated can view reports"
  ON reports FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can create reports"
  ON reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── SCAN SESSIONS ────────────────────────────────────────────
DROP POLICY IF EXISTS "Citizens can view own scans" ON scan_sessions;
DROP POLICY IF EXISTS "Citizens can insert scans" ON scan_sessions;
DROP POLICY IF EXISTS "Authenticated can view scans" ON scan_sessions;
DROP POLICY IF EXISTS "Authenticated can insert scans" ON scan_sessions;
CREATE POLICY "Authenticated can view scans"
  ON scan_sessions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can insert scans"
  ON scan_sessions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── SCAN ITEMS ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Citizens can view their scan items" ON scan_items;
DROP POLICY IF EXISTS "Citizens can insert scan items" ON scan_items;
DROP POLICY IF EXISTS "Authenticated can view scan items" ON scan_items;
DROP POLICY IF EXISTS "Authenticated can insert scan items" ON scan_items;
CREATE POLICY "Authenticated can view scan items"
  ON scan_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can insert scan items"
  ON scan_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── Enable realtime (safe even if already added) ─────────────
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE pickup_requests;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE municipal_pickup_queue;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE municipal_alerts;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE collection_records;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- Fix ALL trigger functions — must be SECURITY DEFINER
-- so they bypass RLS (triggers run as calling user by default,
-- which is the citizen — they don't have INSERT on municipal tables)
-- ============================================================

-- Fix create_carbon_wallet
CREATE OR REPLACE FUNCTION create_carbon_wallet()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.portal = 'citizen' THEN
    INSERT INTO carbon_wallets (citizen_id)
    VALUES (NEW.id)
    ON CONFLICT (citizen_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Fix update_wallet_on_collection
CREATE OR REPLACE FUNCTION update_wallet_on_collection()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO carbon_wallets (citizen_id, total_credits, co2_saved_kg, trees_saved, energy_saved_kwh)
  VALUES (
    NEW.citizen_id,
    NEW.credits_earned,
    NEW.co2_saved_kg,
    FLOOR(NEW.co2_saved_kg / 22),
    NEW.co2_saved_kg * 350
  )
  ON CONFLICT (citizen_id) DO UPDATE
    SET total_credits    = carbon_wallets.total_credits + EXCLUDED.total_credits,
        co2_saved_kg     = carbon_wallets.co2_saved_kg  + EXCLUDED.co2_saved_kg,
        trees_saved      = carbon_wallets.trees_saved   + EXCLUDED.trees_saved,
        energy_saved_kwh = carbon_wallets.energy_saved_kwh + EXCLUDED.energy_saved_kwh,
        updated_at       = NOW();

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

-- Fix enqueue_pickup
CREATE OR REPLACE FUNCTION enqueue_pickup()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO municipal_pickup_queue (pickup_id, city, display_time)
  VALUES (
    NEW.id,
    COALESCE((SELECT city FROM profiles WHERE id = NEW.citizen_id), 'Indore'),
    TO_CHAR(NOW(), 'HH12:MI AM')
  );
  RETURN NEW;
END;
$$;

-- Re-create triggers (safe: DROP IF EXISTS first)
DROP TRIGGER IF EXISTS trg_enqueue_pickup ON pickup_requests;
CREATE TRIGGER trg_enqueue_pickup
  AFTER INSERT ON pickup_requests
  FOR EACH ROW EXECUTE FUNCTION enqueue_pickup();

DROP TRIGGER IF EXISTS trg_wallet_on_collection ON collection_records;
CREATE TRIGGER trg_wallet_on_collection
  AFTER INSERT ON collection_records
  FOR EACH ROW EXECUTE FUNCTION update_wallet_on_collection();

DROP TRIGGER IF EXISTS trg_create_wallet ON profiles;
CREATE TRIGGER trg_create_wallet
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_carbon_wallet();

-- ============================================================
-- Make generate_pickup_id() SECURITY DEFINER so it works
-- for any authenticated user
-- ============================================================
CREATE OR REPLACE FUNCTION generate_pickup_id()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  seq_num INT;
  date_str TEXT;
BEGIN
  date_str := TO_CHAR(NOW(), 'YYYY-MMDD');
  SELECT COALESCE(MAX(
    CASE WHEN id ~ ('^PKP-' || date_str || '-\d+$')
         THEN SPLIT_PART(id, '-', 4)::INT
         ELSE 0 END
  ), 0) + 1 INTO seq_num FROM pickup_requests;
  RETURN 'PKP-' || date_str || '-' || LPAD(seq_num::TEXT, 3, '0');
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION generate_pickup_id() TO authenticated;

-- ============================================================
-- Done! Now the demo app can switch portals freely.
-- ============================================================
