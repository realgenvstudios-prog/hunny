-- 1. Add image_url to catering_packages (run once)
ALTER TABLE catering_packages ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Create popular_builds table
CREATE TABLE IF NOT EXISTS popular_builds (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL DEFAULT '',
  subtitle     text NOT NULL DEFAULT '',
  ingredients  text NOT NULL DEFAULT '',
  price        numeric(10,2) NOT NULL DEFAULT 0,
  image_url    text,
  default_people integer NOT NULL DEFAULT 10,
  active       boolean NOT NULL DEFAULT true,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);

-- 3. RLS
ALTER TABLE popular_builds ENABLE ROW LEVEL SECURITY;

-- Public can read active builds
CREATE POLICY "Public can read popular_builds"
  ON popular_builds FOR SELECT
  USING (true);

-- Authenticated admins can manage builds
CREATE POLICY "Admins can manage popular_builds"
  ON popular_builds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- 4. Seed data
INSERT INTO popular_builds (title, subtitle, ingredients, price, image_url, default_people, active, sort_order) VALUES
(
  'WORK ANYWHERE',
  'TRIPLE PROTEIN',
  '2x Guacamole | Sofritas Plant-Based Protein | Salad Lettuce | Cilantro-Lime Brown Rice | Fajita Veggies | Shredded Cheese | Taco Lettuce | Fresh Tomato Salsa | Roasted-Chili Corn Salsa | Soft Flour Tortillas',
  120,
  'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775618758/BYOC-crop_iuz0ju.png',
  10, true, 1
),
(
  'OFFICE PARTY',
  'DOUBLE PROTEIN',
  '2x Guacamole | Sofritas Plant-Based Protein | Salad Lettuce | Cilantro-Lime Brown Rice | Fajita Veggies | Shredded Cheese | Taco Lettuce | Fresh Tomato Salsa | Roasted-Chili Corn Salsa | Soft Flour Tortillas',
  80,
  'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775622199/byo-spread-double.c1168de0_jyghkc.png',
  10, true, 2
),
(
  'STREET FEAST',
  'SINGLE PROTEIN',
  '2x Guacamole | Sofritas Plant-Based Protein | Salad Lettuce | Cilantro-Lime Brown Rice | Fajita Veggies | Shredded Cheese | Taco Lettuce | Fresh Tomato Salsa | Roasted-Chili Corn Salsa | Soft Flour Tortillas',
  65,
  'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775622199/byo-spread-single.9fae9ce9_rlilbw.png',
  10, true, 3
),
(
  'FAMILY SPREAD',
  'TRIPLE PROTEIN',
  '2x Guacamole | Sofritas Plant-Based Protein | Salad Lettuce | Cilantro-Lime Brown Rice | Fajita Veggies | Shredded Cheese | Taco Lettuce | Fresh Tomato Salsa | Roasted-Chili Corn Salsa | Soft Flour Tortillas',
  120,
  'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775622204/byo-spread-triple.3453fa98_sdlzx1.png',
  10, true, 4
);
