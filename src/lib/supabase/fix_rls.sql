-- RLS Policy Fix for Members Table
-- Run this in your Supabase SQL Editor

-- 1. Allow users to INSERT their own profile (Required for Upsert if row is missing)
create policy "Users can insert their own profile"
  on public.members for insert
  with check ( auth.uid() = id );

-- 2. Ensure Update policy is correct (Already exists but good to verify)
-- drop policy if exists "Users can update own profile" on public.members;
-- create policy "Users can update own profile"
--   on public.members for update
--   using ( auth.uid() = id );
