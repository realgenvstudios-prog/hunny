-- ============================================================
-- HUNNY Fast Food E-Commerce — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. PROFILES (extends auth.users) ────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  phone       text,
  created_at  timestamptz default now()
);

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 2. CATEGORIES ────────────────────────────────────────────
create table if not exists public.categories (
  id         serial primary key,
  name       text not null unique,   -- e.g. 'sandwiches', 'shawarma'
  slug       text not null unique,   -- URL friendly
  sort_order int  default 0
);

insert into public.categories (name, slug, sort_order) values
  ('Sandwiches',    'sandwiches',    1),
  ('Shawarma',      'shawarma',      2),
  ('Salads',        'salads',        3),
  ('Fries',         'fries',         4),
  ('Chicken Wings', 'chicken-wings', 5),
  ('Ice Cream',     'ice-creams',    6),
  ('Waffles',       'waffles',       7),
  ('Rice Meals',    'rice-meals',    8),
  ('Fresh Juice',   'fresh-juice',   9),
  ('Pastries',      'pastries',      10)
on conflict do nothing;

-- ── 3. PRODUCTS ──────────────────────────────────────────────
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  name         text        not null,
  description  text,
  price        numeric(10, 2) not null,
  category_id  int         references public.categories(id),
  image_url    text,
  available    boolean     default true,
  featured     boolean     default false,
  created_at   timestamptz default now()
);

-- ── 4. CART ITEMS ─────────────────────────────────────────────
create table if not exists public.cart_items (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  product_id   uuid        not null references public.products(id) on delete cascade,
  quantity     int         not null default 1 check (quantity > 0),
  created_at   timestamptz default now(),
  unique (user_id, product_id)
);

-- ── 5. ORDERS ─────────────────────────────────────────────────
do $$ begin
  create type order_status as enum ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');
exception when duplicate_object then null;
end $$;

create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid           not null references auth.users(id),
  status        order_status   default 'pending',
  subtotal      numeric(10, 2) not null,
  delivery_fee  numeric(10, 2) not null default 20,
  total         numeric(10, 2) not null,
  delivery_address text,
  notes         text,
  payment_ref   text,           -- Paystack reference
  paid_at       timestamptz,
  created_at    timestamptz    default now()
);

-- ── 6. ORDER ITEMS ────────────────────────────────────────────
create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid           not null references public.orders(id) on delete cascade,
  product_id  uuid           references public.products(id),
  name        text           not null,  -- snapshot at time of order
  price       numeric(10, 2) not null,  -- snapshot at time of order
  quantity    int            not null,
  image_url   text
);

-- ── 7. CATERING REQUESTS ──────────────────────────────────────
create table if not exists public.catering_requests (
  id           uuid primary key default gen_random_uuid(),
  name         text        not null,
  email        text        not null,
  phone        text,
  event_date   date,
  guest_count  int,
  message      text,
  created_at   timestamptz default now()
);

-- ── 8. CONTACT MESSAGES ───────────────────────────────────────
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Profiles: users can only read/update their own
alter table public.profiles enable row level security;
drop policy if exists "Users can view own profile"   on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Products: public read, admin write (admin check via role in profiles — extend later)
alter table public.products enable row level security;
drop policy if exists "Products are publicly readable" on public.products;
create policy "Products are publicly readable" on public.products for select using (true);

-- Categories: public read
alter table public.categories enable row level security;
drop policy if exists "Categories are publicly readable" on public.categories;
create policy "Categories are publicly readable" on public.categories for select using (true);

-- Cart: users can only access their own cart
alter table public.cart_items enable row level security;
drop policy if exists "Users manage own cart" on public.cart_items;
create policy "Users manage own cart" on public.cart_items for all using (auth.uid() = user_id);

-- Orders: users can only see their own orders
alter table public.orders enable row level security;
drop policy if exists "Users view own orders"   on public.orders;
drop policy if exists "Users create own orders" on public.orders;
create policy "Users view own orders"   on public.orders for select using (auth.uid() = user_id);
create policy "Users create own orders" on public.orders for insert with check (auth.uid() = user_id);

-- Order items: readable if you own the order
alter table public.order_items enable row level security;
drop policy if exists "Users view own order items" on public.order_items;
create policy "Users view own order items" on public.order_items for select
  using (exists (select 1 from public.orders where orders.id = order_id and orders.user_id = auth.uid()));

-- Catering & contact: anyone can insert (public form submissions)
alter table public.catering_requests enable row level security;
drop policy if exists "Anyone can submit catering request" on public.catering_requests;
create policy "Anyone can submit catering request" on public.catering_requests for insert with check (true);

alter table public.contact_messages enable row level security;
drop policy if exists "Anyone can submit contact message" on public.contact_messages;
create policy "Anyone can submit contact message" on public.contact_messages for insert with check (true);
