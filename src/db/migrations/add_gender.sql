-- Add gender column to members table if it doesn't exist
ALTER TABLE members ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female'));
