-- Run this in: Supabase Dashboard → SQL Editor
-- Fixes: collection_records INSERT policy to allow truck drivers (portal='driver')
-- alongside municipal users (portal='municipal')

DROP POLICY IF EXISTS "Municipal / collectors can insert collection records" ON collection_records;

CREATE POLICY "Municipal and drivers can insert collection records"
  ON collection_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.portal IN ('municipal', 'driver')
    )
  );
