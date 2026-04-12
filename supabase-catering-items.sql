-- Create catering_items table
CREATE TABLE IF NOT EXISTS catering_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  category    text NOT NULL, -- 'Base' | 'Protein' | 'Toppings' | 'Salsas' | 'Tortilla'
  image_url   text,
  active      boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE catering_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'catering_items' AND policyname = 'Public can read catering_items'
  ) THEN
    CREATE POLICY "Public can read catering_items"
      ON catering_items FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'catering_items' AND policyname = 'Admins can manage catering_items'
  ) THEN
    CREATE POLICY "Admins can manage catering_items"
      ON catering_items FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
      );
  END IF;
END $$;

-- Seed default items
INSERT INTO catering_items (name, category, sort_order) VALUES
('Cilantro-Lime White Rice', 'Base', 1),
('Cilantro-Lime Brown Rice', 'Base', 2),
('Black Beans',              'Base', 3),
('Pinto Beans',              'Base', 4),
('Salad Lettuce',            'Base', 5),
('Chicken',                  'Protein', 1),
('Carnitas',                 'Protein', 2),
('Steak',                    'Protein', 3),
('Beef Barbacoa',            'Protein', 4),
('Sofritas',                 'Protein', 5),
('Guacamole',                'Protein', 6),
('Fajita Veggies',           'Toppings', 1),
('Shredded Cheese',          'Toppings', 2),
('Sour Cream',               'Toppings', 3),
('Queso Blanco',             'Toppings', 4),
('Romaine Lettuce',          'Toppings', 5),
('Fresh Tomato Salsa',       'Salsas', 1),
('Roasted Chili-Corn Salsa', 'Salsas', 2),
('Tomatillo Green Chili',    'Salsas', 3),
('Tomatillo Red Chili',      'Salsas', 4),
('Soft Flour Tortillas',     'Tortilla', 1),
('Crispy Corn Tortillas',    'Tortilla', 2),
('Hard Shell Tortillas',     'Tortilla', 3);

-- ─────────────────────────────────────────────────────
-- Storage policies for the "catering-images" bucket
-- NOTE: Create the bucket manually in Supabase Dashboard
--   Storage → New Bucket → Name: catering-images → Public: ON
-- Then run the policies below:
-- ─────────────────────────────────────────────────────

-- Anyone can view images (needed for user-facing build page)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view catering images'
  ) THEN
    CREATE POLICY "Public can view catering images"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'catering-images');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can upload catering images'
  ) THEN
    CREATE POLICY "Admins can upload catering images"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'catering-images'
        AND EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can update catering images'
  ) THEN
    CREATE POLICY "Admins can update catering images"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = 'catering-images'
        AND EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can delete catering images'
  ) THEN
    CREATE POLICY "Admins can delete catering images"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'catering-images'
        AND EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
      );
  END IF;
END $$;
