-- Add card_role column to members table to specify which role appears on the member card
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS card_role text;
