-- Add new columns for company details
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS company_turnover text,
ADD COLUMN IF NOT EXISTS number_of_employees text;

-- Add comment to clarify visibility
COMMENT ON COLUMN public.members.company_turnover IS 'Private field: Visible only to owner and admin';
COMMENT ON COLUMN public.members.number_of_employees IS 'Private field: Visible only to owner and admin';
