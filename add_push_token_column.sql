ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS push_token text;
