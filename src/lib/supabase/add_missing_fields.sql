-- Add missing columns for profile enhancement

ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS gyiad_projects text,
ADD COLUMN IF NOT EXISTS linkedin_url text;

-- Also verify websites column exists and is typically an array or jsonb, defaulting to text array here if missing
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS websites text[]; 
