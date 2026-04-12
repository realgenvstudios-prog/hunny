-- Add optional price column to catering_items
-- NULL = included in package price (e.g. Base, Protein, Toppings)
-- A number = extra cost per unit shown on the build page (e.g. Drinks, Add-ons)
ALTER TABLE catering_items
  ADD COLUMN IF NOT EXISTS price numeric(10,2) DEFAULT NULL;
