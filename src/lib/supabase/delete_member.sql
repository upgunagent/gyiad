-- Delete Member Script
-- Run this in Supabase SQL Editor to delete the specific user for re-testing.

-- 1. Delete from public.members (Profile Data)
DELETE FROM public.members 
WHERE email = 'otopkan@gmail.com';

-- 2. Delete from auth.users (Authentication Data)
-- This is the most important part to allow signing up with the same email again.
DELETE FROM auth.users 
WHERE email = 'otopkan@gmail.com';

-- Note: If you have set up "Run as Transaction" (usually default), both will run together.
-- If the user ID is linked with "ON DELETE CASCADE", deleting from auth.users might allow auto-deletion of members row too,
-- but running both explicitly ensures it's clean.
