-- ── DISCOUNT CODES ───────────────────────────────────────────
create table if not exists public.discount_codes (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  type       text not null check (type in ('percent','fixed')),
  value      numeric not null,
  min_order  numeric default 0,
  uses       integer default 0,
  max_uses   integer default 100,
  expires_at date,
  active     boolean default true,
  created_at timestamptz default now()
);

alter table public.discount_codes enable row level security;

drop policy if exists "Admins can manage discount codes" on public.discount_codes;
create policy "Admins can manage discount codes"
  on public.discount_codes for all
  using (public.is_admin())
  with check (public.is_admin());

-- Users can read active codes (for validation at checkout)
drop policy if exists "Public can read active codes" on public.discount_codes;
create policy "Public can read active codes"
  on public.discount_codes for select
  using (active = true);

-- Seed some codes
insert into public.discount_codes (code, type, value, min_order, uses, max_uses, expires_at, active) values
  ('HUNNY10',   'percent', 10, 100, 0, 100, '2026-04-30', true),
  ('WELCOME20', 'percent', 20, 0,   0, 50,  '2026-04-30', true),
  ('GHC50OFF',  'fixed',   50, 200, 0, 100, '2026-04-15', false),
  ('SUMMER15',  'percent', 15, 150, 0, 200, '2026-05-31', true)
on conflict (code) do nothing;


-- ── STORE SETTINGS ───────────────────────────────────────────
create table if not exists public.store_settings (
  id           integer primary key default 1 check (id = 1), -- singleton row
  store_name   text default 'Hunny Fast Food',
  email        text default 'hello@hunny.com',
  phone        text default '+233 24 000 0000',
  address      text default '14 Cantonments Rd, Accra, Ghana',
  currency     text default 'GHC',
  delivery_fee numeric default 20,
  min_order    numeric default 50,
  open_time    time default '08:00',
  close_time   time default '22:00',
  delivery_zones text[] default array['Accra Central','Cantonments','East Legon','Osu','Airport'],
  updated_at   timestamptz default now()
);

alter table public.store_settings enable row level security;

drop policy if exists "Admins can manage settings" on public.store_settings;
create policy "Admins can manage settings"
  on public.store_settings for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Public can read settings" on public.store_settings;
create policy "Public can read settings"
  on public.store_settings for select
  using (true);

-- Insert the singleton row
insert into public.store_settings (id) values (1) on conflict (id) do nothing;
