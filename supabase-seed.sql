-- ============================================================
-- HUNNY — Products Seed Data
-- Run this AFTER supabase-schema.sql
-- Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── SANDWICHES ───────────────────────────────────────────────
insert into public.products (name, description, price, category_id, image_url) values
  ('Ham Sandwich',           'Ham, Cheese, Crispy bread',                                                        120, (select id from categories where slug='sandwiches'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775620043/bas8_tpgllp.png'),
  ('Cheese Sandwich',        'Cheese, Crispy bread',                                                              120, (select id from categories where slug='sandwiches'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775620034/bas2_bu6d6q.png'),
  ('Egg Sandwich',           'Eggs, butter, Fresh Basil, Crispy bread',                                          120, (select id from categories where slug='sandwiches'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775620033/bas5_dzfych.png'),
  ('Korean Street Sandwich', 'Cheese, Ham, Eggs, Mayonnaise, Onions, Ketchup, Crispy bread, Salt & Pepper',      120, (select id from categories where slug='sandwiches'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775620045/bas3_mfnvju.png'),
  ('Chicken Sandwich',       'Chicken, cheese, Fresh Basil, Crispy bread',                                       120, (select id from categories where slug='sandwiches'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775620038/bas4_d8ikoq.png'),
  ('Tuna Sandwich',          'Celery, Fresh Dill, Onions, Tuna, Mayonnaise, Crispy bread',                       120, (select id from categories where slug='sandwiches'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775620033/bas6_tn7vw5.png'),
  ('Steak Sandwich',         'Grilled Steak, Onions, Pepper sauce, Crispy bread',                                120, (select id from categories where slug='sandwiches'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775620031/bas1_xcw8ww.png'),
  ('Club Sandwich',          'Chicken, Bacon, Lettuce, Tomato, Mayo, Toast',                                     120, (select id from categories where slug='sandwiches'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775620041/bas7_sqw3sa.png');

-- ── SHAWARMA ─────────────────────────────────────────────────
insert into public.products (name, description, price, category_id, image_url) values
  ('Chicken Shawarma', 'Grilled chicken, lettuce, tomato, pickles, garlic sauce, pita wrap',  120, (select id from categories where slug='shawarma'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775578508/cb4_ixxrij.png'),
  ('Beef Shawarma',    'Seasoned beef, onions, tomato, tahini sauce, pita wrap',               120, (select id from categories where slug='shawarma'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775623860/cb1_s7otl1.png'),
  ('Mixed Shawarma',   'Chicken & beef, lettuce, pickles, chilli sauce, pita wrap',            120, (select id from categories where slug='shawarma'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775623866/cb3_xpbsac.png'),
  ('Spicy Shawarma',   'Spiced chicken, jalapeños, red onion, sriracha mayo, pita wrap',       120, (select id from categories where slug='shawarma'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775623877/cb2_zj7g8z.png');

-- ── SALADS ───────────────────────────────────────────────────
insert into public.products (name, description, price, category_id, image_url) values
  ('Grilled Chicken Salad', 'Grilled chicken, corn, avocado, mixed greens, tahini dressing',          120, (select id from categories where slug='salads'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775623927/ao10_qjsql0.png'),
  ('Caesar Salad',          'Romaine lettuce, croutons, parmesan, caesar dressing',                   120, (select id from categories where slug='salads'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775625216/ao9_ojkcrm.png'),
  ('Egg & Potato Salad',    'Boiled eggs, potatoes, red onion, fresh herbs, mustard dressing',        120, (select id from categories where slug='salads'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775623927/ao5_a1m8lh.png'),
  ('Nicoise Salad',         'Tuna, boiled eggs, green beans, olives, tomato, anchovy dressing',       120, (select id from categories where slug='salads'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775623919/ao3_sh40db.png'),
  ('Garden Fresh Salad',    'Mixed greens, cherry tomatoes, cucumber, red onion, vinaigrette',        120, (select id from categories where slug='salads'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775618760/ao1-2_vfsrmq.png'),
  ('Greek Salad',           'Tomato, cucumber, red onion, Kalamata olives, feta cheese, oregano',     120, (select id from categories where slug='salads'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775623923/ao7_rqdtnc.png'),
  ('Caprese Salad',         'Fresh mozzarella, tomato, basil, olive oil, balsamic glaze',             120, (select id from categories where slug='salads'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775623924/ao6_vj4mut.png');

-- ── FRIES ────────────────────────────────────────────────────
insert into public.products (name, description, price, category_id, image_url) values
  ('Classic Fries',      'Golden crispy fries, sea salt',                                        120, (select id from categories where slug='fries'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775623882/dbb1_covhk9.png'),
  ('Loaded Cheese Fries','Fries, melted cheese sauce, jalapeños, spring onions',                 120, (select id from categories where slug='fries'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775623923/dbb4_ihgjgm.png'),
  ('Chicken & Fries',    'Grilled chicken, golden fries, ketchup dip',                          120, (select id from categories where slug='fries'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775623880/dbb5_nsppvg.png'),
  ('Sausage Fries',      'Cocktail sausages, seasoned fries, cheese sauce',                     120, (select id from categories where slug='fries'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775623870/dbb2_idvsco.png'),
  ('BBQ Pulled Fries',   'Fries, BBQ pulled beef, pickled onions, ranch drizzle',               120, (select id from categories where slug='fries'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775623882/dbb6_i8br5l.png'),
  ('Spicy Wings & Fries','Spiced chicken wings, seasoned fries, hot sauce',                     120, (select id from categories where slug='fries'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775623873/dbb7_zr1jge.png'),
  ('Tomato Herb Fries',  'Crispy fries, sun-dried tomatoes, fresh herbs, garlic oil',           120, (select id from categories where slug='fries'), 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775623886/dbb3_g9hcja.png');
