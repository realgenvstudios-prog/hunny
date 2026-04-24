-- Create catering_categories table
CREATE TABLE IF NOT EXISTS catering_categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  active     boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE catering_categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'catering_categories' AND policyname = 'Public can read catering_categories'
  ) THEN
    CREATE POLICY "Public can read catering_categories"
      ON catering_categories FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'catering_categories' AND policyname = 'Admins can manage catering_categories'
  ) THEN
    CREATE POLICY "Admins can manage catering_categories"
      ON catering_categories FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
      );
  END IF;
END $$;

-- Seed default categories
INSERT INTO catering_categories (name, sort_order) VALUES
('Base',     1),
('Protein',  2),
('Toppings', 3),
('Drinks',   4),
('Add ons', 5)
ON CONFLICT (name) DO NOTHING;
