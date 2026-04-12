-- Add show_on_chips_dips flag to catering_items
-- Run this in the Supabase SQL Editor

ALTER TABLE catering_items
  ADD COLUMN IF NOT EXISTS show_on_chips_dips boolean NOT NULL DEFAULT false;
