-- Run this in Supabase SQL Editor to add payment columns to orders table

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
