-- Migration: Switch from single board_role to multiple board_roles

-- 1. Ensure 'left' (Ayrılmış Üye) exists in member_type enum
-- RUN THIS FILE FIRST.
ALTER TYPE public.member_type ADD VALUE IF NOT EXISTS 'left';

-- 2. Drop the old column
ALTER TABLE public.members DROP COLUMN IF EXISTS board_role;

-- 3. Add new array column
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS board_roles text[] DEFAULT '{}';

-- 4. Add other missing columns just in case
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS gyiad_projects text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS linkedin_url text;

