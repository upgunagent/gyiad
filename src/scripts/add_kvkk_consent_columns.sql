-- Add new KVKK consent columns to members table
ALTER TABLE members
ADD COLUMN IF NOT EXISTS kvkk_membership_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS kvkk_newsletter_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS kvkk_photo_sharing_consent boolean DEFAULT false;

-- Add comments
COMMENT ON COLUMN members.kvkk_membership_consent IS 'Has the member accepted the Membership KVKK text?';
COMMENT ON COLUMN members.kvkk_newsletter_consent IS 'Has the member accepted the Newsletter KVKK text?';
COMMENT ON COLUMN members.kvkk_photo_sharing_consent IS 'Has the member accepted the Photo Sharing KVKK text?';
