-- Fix RLS policies for system_settings to ensure readability
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON system_settings;
DROP POLICY IF EXISTS "Enable update for users" ON system_settings;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON system_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON system_settings;

-- Create comprehensive read policy
CREATE POLICY "Allow public read access" ON system_settings
    FOR SELECT USING (true);

-- Create update policy for authenticated users (users updating the admin panel)
CREATE POLICY "Allow authenticated update" ON system_settings
    FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON system_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Verify keys exist (just in case)
INSERT INTO system_settings (key, value)
VALUES 
    ('kvkk_membership_consent_text', ''),
    ('kvkk_newsletter_consent_text', ''),
    ('kvkk_photo_sharing_consent_text', '')
ON CONFLICT (key) DO NOTHING;
