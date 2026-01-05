-- CLEANUP SCRIPT (PART OF SEEDING)
-- This script only deletes the data. To Insert new data, please use the API route.

-- 1. Delete all members EXCEPT the protected ones
DELETE FROM public.members 
WHERE email NOT IN ('otopkan@gmail.com', 'upgunagent@gmail.com');

-- 2. To Insert New Demo Data:
-- Please run the project (npm run dev)
-- And visit: http://localhost:3000/api/seed
-- This is necessary because SQL cannot safely create Auth Users (passwords) without valid hashes.
