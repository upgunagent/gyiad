-- Create Admin User Script
-- 1. Create Identity in auth.users (Please do this via Supabase Dashboard or API if possible, hashing passwords in SQL is hard)
-- HOWEVER, since you asked for SQL:

-- OPTION A: If user 'upgunagent@gmail.com' does NOT exist yet:
-- Unfortunately, inserting into auth.users directly with a plain text password is NOT recommended/easy because of hashing.
-- THE BEST WAY: Sign up this user via the App's Register/Login page (or the demo button logic) first!

-- OPTION B: Assume user is created (via Login page or Sign Up), and we just Make them ADMIN.
-- This is the safest SQL approach.

-- 1. First, go to http://localhost:3000/login (or verify user exists in Auth table)
-- If not, use the "New Member" form logic or just Sign Up manually.

-- 2. Run this to make them Admin:

UPDATE public.members
SET is_admin = true
WHERE email = 'upgunagent@gmail.com';

-- If the profile row (members table) doesn't exist yet for this user (only exists in auth.users),
-- you might need to insert it first manually or trigger the handle_new_user function.
-- But usually, our app flow creates the member row.

-- QUICK SHORTCUT IF YOU WANT TO FORCE INSERT EVERYTHING MANUALLY (Not recommended for password handling):
-- Please create the user in Authentication tab manually. Then run:
-- insert into public.members (id, email, is_admin) values ('[USER_UUID_FROM_AUTH_TAB]', 'upgunagent@gmail.com', true);
