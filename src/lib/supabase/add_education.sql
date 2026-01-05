-- Add education column to members table
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb;

-- Comment on column
COMMENT ON COLUMN public.members.education IS 'List of education history: [{ level, school, department, year }]';
