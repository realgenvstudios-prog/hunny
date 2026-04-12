-- ============================================================
-- HUNNY Admin — Run this AFTER supabase-schema.sql
-- Adds is_admin flag and admin-level RLS policies
-- ============================================================

-- 1. Add is_admin column to profiles
alter table public.profiles
  add column if not exists is_admin boolean default false;

-- 2. Mark your account as admin (replace with YOUR user UUID from Supabase Auth → Users)
-- update public.profiles set is_admin = true where id = 'YOUR-USER-UUID-HERE';

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- 3. Profiles: admins can read all profiles
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- 4. Orders: admins can read + update all orders
drop policy if exists "Admins can view all orders" on public.orders;
drop policy if exists "Admins can update all orders" on public.orders;
create policy "Admins can view all orders"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());
create policy "Admins can update all orders"
  on public.orders for update
  using (public.is_admin());

-- 5. Order items: admins can view all
drop policy if exists "Admins can view all order items" on public.order_items;
create policy "Admins can view all order items"
  on public.order_items for select
  using (
    exists (select 1 from public.orders where orders.id = order_id and orders.user_id = auth.uid())
    or public.is_admin()
  );

-- 6. Products: admins can insert/update/delete
drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- 7. Categories: admins can manage
drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- 8. Catering requests: admins can read + update all
drop policy if exists "Admins can view all catering requests" on public.catering_requests;
drop policy if exists "Admins can update catering requests" on public.catering_requests;
create policy "Admins can view all catering requests"
  on public.catering_requests for select
  using (public.is_admin());
create policy "Admins can update catering requests"
  on public.catering_requests for update
  using (public.is_admin());

-- 9. Contact messages: admins can read all
drop policy if exists "Admins can view contact messages" on public.contact_messages;
create policy "Admins can view contact messages"
  on public.contact_messages for select
  using (public.is_admin());
