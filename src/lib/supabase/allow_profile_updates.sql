-- Enable RLS updates for members
-- Users should be able to update their own profile based on their ID

-- Drop existing policy if it might conflict (optional, but safer to just create if missing)
DROP POLICY IF EXISTS "Users can update own profile" ON public.members;

CREATE POLICY "Users can update own profile"
ON public.members
FOR UPDATE
USING ( auth.uid() = id );

-- Also ensure specific columns aren't restricted if using column-level security (unlikely here but good to know)
-- Supabase plain RLS covers all columns by default unless Grant is restricted.
