-- Add is_hidden column to members table if it doesn't exist
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN public.members.is_hidden IS 'If true, the member is hidden from public lists but can still access the platform.';
