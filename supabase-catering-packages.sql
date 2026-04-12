-- ── CATERING PACKAGES ───────────────────────────────────────
-- These are the tiers shown in the CateringHero (Single, Double, Triple)
-- Admin manages them; user-frontend reads them.

create table if not exists public.catering_packages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  badge       text,
  price       numeric not null,
  description text,
  cta         text,
  active      boolean default true,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

alter table public.catering_packages enable row level security;

-- Anyone can read active packages
drop policy if exists "Public can read catering packages" on public.catering_packages;
create policy "Public can read catering packages"
  on public.catering_packages for select
  using (active = true);

-- Only admins can manage
drop policy if exists "Admins can manage catering packages" on public.catering_packages;
create policy "Admins can manage catering packages"
  on public.catering_packages for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed the default tiers
insert into public.catering_packages (name, badge, price, description, cta, active, sort_order) values
  ('SINGLE', 'BEST VALUE',    65,  'Build Your Own catering and keep it simple and delicious. The Single comes with 1 protein, 2 bases, 2 toppings, 2 salsas, and 1 type of tortilla.', 'BUILD YOUR SINGLE', true, 1),
  ('DOUBLE', 'FAN FAVORITE',  80,  'Go bigger with the Double — 2 proteins, 3 bases, 3 toppings, 3 salsas, and 2 types of tortilla. Perfect for groups who love variety.',            'BUILD YOUR DOUBLE', true, 2),
  ('TRIPLE', 'MOST VARIETY',  120, 'The ultimate spread — 3 proteins, 4 bases, 4 toppings, 4 salsas, and 3 types of tortilla. Maximum variety for the biggest appetites.',           'BUILD YOUR TRIPLE', true, 3)
on conflict do nothing;
