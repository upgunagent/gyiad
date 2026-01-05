-- Add company_address column to members table if it doesn't exist
ALTER TABLE members ADD COLUMN IF NOT EXISTS company_address text;
