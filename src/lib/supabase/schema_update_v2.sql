-- Rename existing type to avoid confusion, or drop and recreate if not used much. 
-- Since we are in dev, dropping is cleaner but let's try to alter to preserve data.

-- 1. Create New Enums
create type membership_category as enum ('individual', 'corporate'); -- Bireysel / Kurumsal
create type membership_status as enum ('active', 'honorary', 'left'); -- Aktif / Fahri / Ayrılmış

-- Update board_role enum (Need to recreate or add values)
-- Postgres doesn't support easy reordering, so we'll just add values.
-- Current: 'none', 'president', 'executive_board', 'board_member', 'board_reserve', 'audit_board'
-- Needed: 'vice_president', 'past_president', 'founder', 'high_advisory_board' (Yüksek İstişare)
alter type board_role add value if not exists 'vice_president';
alter type board_role add value if not exists 'past_president';
alter type board_role add value if not exists 'founder';
alter type board_role add value if not exists 'high_advisory_board';

-- 2. Alter Table
alter table public.members
  -- Add new categorization
  add column if not exists membership_category membership_category default 'individual',
  
  -- Rename/Change member_type to match status concept
  -- We can keep 'member_type' column but change its type, but it's risky with data.
  -- Let's add 'status' column and migrate data.
  add column if not exists status membership_status default 'active',
  
  -- Add Date Fields
  add column if not exists membership_start_date date,
  add column if not exists membership_end_date date;

-- 3. Data Migration (Optional, if we had real data)
-- update public.members set status = 'active' where member_type = 'active';
-- update public.members set status = 'honorary' where member_type = 'honorary';

-- 4. Drop old column if confirmed (or keep for safety)
-- alter table public.members drop column member_type;
