'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { mockMembers } from '@/data/mock-members';

export default function SeedButton() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [msg, setMsg] = useState('');
    const supabase = createClient();

    const handleSeed = async () => {
        try {
            setStatus('loading');

            // 1. Check if user currently logged in
            let { data: { user } } = await supabase.auth.getUser();

            // 2. If not, sign up a test user
            if (!user) {
                const testEmail = 'ahmet.yilmaz@yilmazholding.com';
                const testPass = 'gyiad123'; // Simple password for demo

                // Try sign in first
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: testEmail,
                    password: testPass
                });

                if (signInError) {
                    // If error is "Email not confirmed", stop and tell user
                    if (signInError.message.includes('Email not confirmed')) {
                        throw new Error("Bu e-posta adresi kayıtlı ancak onaylanmamış. Lütfen 'src/lib/supabase/confirm_user.sql' dosyasındaki SQL kodunu Supabase'de çalıştırın.");
                    }
                    console.log("Sign in failed, trying sign up...", signInError.message);
                }

                if (signInData.user) {
                    user = signInData.user;
                } else {
                    // Sign up
                    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                        email: testEmail,
                        password: testPass,
                        options: {
                            data: { full_name: 'Ahmet Yılmaz' }
                        }
                    });

                    if (signUpError) {
                        if (signUpError.message.includes('rate_limit')) {
                            throw new Error("Çok fazla deneme yapıldı. Kullanıcı muhtemelen var ama onaylı değil. Lütfen 'src/lib/supabase/confirm_user.sql' dosyasındaki kodu çalıştırın.");
                        }
                        throw signUpError;
                    }
                    user = signUpData.user;
                }
            }

            if (!user) throw new Error('Kullanıcı oluşturulamadı/giriş yapılamadı.');

            // 3. Upsert Profile Data from Mock
            const mockMember = mockMembers[0];
            const profileData = {
                id: user.id, // Important: Match Auth ID
                email: user.email,
                full_name: mockMember.full_name,
                avatar_url: mockMember.avatar_url,
                company_name: mockMember.company_name,
                sector: mockMember.sector,
                position: mockMember.position,
                websites: mockMember.websites,
                education: mockMember.education,
                languages: mockMember.languages,
                other_memberships: mockMember.other_memberships,
                member_type: 'active', // Enum
                membership_date: mockMember.membership_date,
                // membership_end_date: mockMember.membership_end_date, // Type conflict in mock
                board_role: 'president',
                gyiad_projects: mockMember.gyiad_projects,
                birth_date: '1975-04-12', // Mock date match
                marital_status: 'married'
            };

            const { error: upsertError } = await supabase
                .from('members')
                .upsert(profileData);

            if (upsertError) throw upsertError;

            setStatus('success');
            setMsg('Veritabanı senkronize edildi! Sayfa yenileniyor...');
            setTimeout(() => window.location.reload(), 1500);

        } catch (err: any) {
            console.error("Seed Error:", err);
            console.error("Error Detail:", JSON.stringify(err, null, 2));
            setStatus('error');
            setMsg(err.message || 'Bir hata oluştu. Konsolu kontrol ediniz.');
        }
    };

    if (status === 'success') return <div className="text-green-600 font-bold text-sm bg-green-50 p-2 rounded">{msg}</div>;

    return (
        <button
            onClick={handleSeed}
            disabled={status === 'loading'}
            className="fixed bottom-4 right-4 bg-gray-800 text-white text-xs px-3 py-2 rounded shadow opacity-50 hover:opacity-100 z-[100]"
        >
            {status === 'loading' ? 'Veritabanı Hazırlanıyor...' : 'DEMO: DB Hazırla & Giriş Yap'}
        </button>
    );
}
