-- Create system_settings table for storing global app settings like KVKK text
CREATE TABLE IF NOT EXISTS system_settings (
    key text PRIMARY KEY,
    value text
);

-- Enable Row Level Security (RLS) on system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read settings (public)
CREATE POLICY "Enable read access for all users" ON system_settings
    FOR SELECT USING (true);

-- Create policy to allow only admins to update settings
-- Note: You might need to adjust this depending on how you identify admins in your auth system.
-- For now, assuming authenticated users with specific emails or roles can update,
-- OR simply allowing authenticated users to update for simplicity in this script, 
-- but ideally should be restricted.
-- Using a generic "authenticated" check for now, specific admin check logic should reside in app layer or strict RLS.
CREATE POLICY "Enable update for authenticated users" ON system_settings
    FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON system_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insert default KVKK text
INSERT INTO system_settings (key, value)
VALUES ('kvkk_text', '<h2>Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni</h2><p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, üyelerimizin kişisel verilerinin gizliliğine ve güvenliğine önem veriyoruz...</p>')
ON CONFLICT (key) DO NOTHING;

-- Add KVKK consent columns to members table
ALTER TABLE members
ADD COLUMN IF NOT EXISTS kvkk_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS kvkk_consent_date timestamptz;

-- Comment on columns
COMMENT ON COLUMN members.kvkk_consent IS 'Has the member accepted the KVKK text?';
COMMENT ON COLUMN members.kvkk_consent_date IS 'When did the member accept the KVKK text?';
