-- Add new KVKK text keys to system_settings
INSERT INTO system_settings (key, value)
VALUES 
    ('kvkk_membership_consent_text', 'GYİAD Dernek Vakıf Üyeliği Açık Rıza Metni içeriği buraya gelecek...'),
    ('kvkk_newsletter_consent_text', 'GYİAD E-Bülten Açık Rıza Metni içeriği buraya gelecek...'),
    ('kvkk_photo_sharing_consent_text', 'GYİAD Fotoğraf Paylaşımı Açık Rıza Metni içeriği buraya gelecek...')
ON CONFLICT (key) DO NOTHING;
