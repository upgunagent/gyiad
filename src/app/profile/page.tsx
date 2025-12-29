
import Sidebar from '@/components/Sidebar';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import MemberProfileView from '@/components/MemberProfileView';

export default async function ProfilePage() {
    const supabase = await createClient();

    // 1. Get Logged In User
    const { data: { user } } = await supabase.auth.getUser();

    let member: any;

    if (user) {
        // 2. Fetch Profile from DB
        const { data } = await supabase.from('members').select('*').eq('id', user.id).single();
        if (data) member = data;
    }

    // 3. Fallback: If no profile found, create a skeleton member from auth user
    if (!member && user) {
        member = {
            id: user.id,
            full_name: user.user_metadata?.full_name || 'İsimsiz Üye',
            email: user.email,
            avatar_url: '/default-avatar.png', // Or a placeholder
            company_name: '-',
            position: '-',
            sector: '-',
            websites: [],
            education: [],
            languages: [],
            member_type: 'Yeni Üye', // Placeholder to avoid crashes
            membership_date: new Date().toISOString(),
            // Add other required fields with defaults to prevent crashes
        };
        // You might want to show a warning banner here too
    } else if (!member) {
        // Should not happen if protected properly, but just in case
        return <div>Lütfen giriş yapınız.</div>;
    }

    return (
        <MemberProfileView
            member={member}
            backLink="/"
            backText="Ana Sayfaya Dön"
            sidebar={<Sidebar />}
            actionButton={
                <Link
                    href="/profile/edit"
                    className="flex items-center gap-2 px-4 py-2 bg-[#0099CC] hover:bg-[#007aa3] text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                >
                    <Pencil className="w-4 h-4" />
                    Profili Düzenle
                </Link>
            }
        />
    );
}