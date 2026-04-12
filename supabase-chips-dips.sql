-- Chips & Dips page config: dip/option choices the admin can manage
CREATE TABLE IF NOT EXISTS chips_dips_options (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,          -- e.g. 'Guacamole', 'Queso Blanco', 'Salsa Roja'
  active     boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chips_dips_options ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chips_dips_options' AND policyname = 'Public can read chips_dips_options'
  ) THEN
    CREATE POLICY "Public can read chips_dips_options"
      ON chips_dips_options FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chips_dips_options' AND policyname = 'Admins can manage chips_dips_options'
  ) THEN
    CREATE POLICY "Admins can manage chips_dips_options"
      ON chips_dips_options FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
      );
  END IF;
END $$;

-- Seed default dip options
INSERT INTO chips_dips_options (name, sort_order) VALUES
('Guacamole',   1),
('Queso Blanco', 2)
ON CONFLICT DO NOTHING;
