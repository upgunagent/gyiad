-- Confirm User Email Script
-- Run this in your Supabase SQL Editor to manually confirm the demo user
-- causing the "Email not confirmed" or "Rate limit" errors.

UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'ahmet.yilmaz@yilmazholding.com';

-- If you want to delete and start over completely:
-- DELETE FROM auth.users WHERE email = 'ahmet.yilmaz@yilmazholding.com';
