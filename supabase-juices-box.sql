-- ── Juice Box Settings (single row) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS juice_box_settings (
  id            int  PRIMARY KEY DEFAULT 1,
  price_per_box numeric NOT NULL DEFAULT 120,
  min_bottles   int     NOT NULL DEFAULT 6,
  active        boolean NOT NULL DEFAULT true
);

INSERT INTO juice_box_settings (id, price_per_box, min_bottles)
  VALUES (1, 120, 6)
  ON CONFLICT (id) DO NOTHING;

-- ── Juice Flavors ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS juice_flavors (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  image_url  text,
  active     boolean     NOT NULL DEFAULT true,
  sort_order int         NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

INSERT INTO juice_flavors (name, sort_order) VALUES
  ('Mango',         1),
  ('Pineapple',     2),
  ('Watermelon',    3),
  ('Orange',        4),
  ('Passion Fruit', 5),
  ('Guava',         6)
ON CONFLICT DO NOTHING;

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE juice_box_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE juice_flavors      ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (re-runnable)
DROP POLICY IF EXISTS "public read juice_box_settings" ON juice_box_settings;
DROP POLICY IF EXISTS "auth write juice_box_settings"  ON juice_box_settings;
DROP POLICY IF EXISTS "public read juice_flavors"      ON juice_flavors;
DROP POLICY IF EXISTS "auth write juice_flavors"       ON juice_flavors;

CREATE POLICY "public read juice_box_settings"
  ON juice_box_settings FOR SELECT USING (true);

CREATE POLICY "admin write juice_box_settings"
  ON juice_box_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "public read juice_flavors"
  ON juice_flavors FOR SELECT USING (true);

CREATE POLICY "admin write juice_flavors"
  ON juice_flavors FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
