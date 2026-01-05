
import { notFound } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { createClient } from '@/lib/supabase/server';
import MemberProfileView from '@/components/MemberProfileView';

export default async function AdminMemberDetailView({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const supabase = await createClient();

    // Check if ID is a valid UUID (optional validity check)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return notFound();

    // Use admin privileges via service role if RLS blocks reading others? 
    // Actually, admins are logged in users, and if RLS allows authenticated users to read profiles, this is fine.
    // If not, we might need to rely on the fact that the user is an admin.
    // Assuming standard read access for now.

    const { data: member } = await supabase.from('members').select('*').eq('id', id).single();

    if (!member) {
        notFound();
    }

    return (
        <MemberProfileView
            member={member}
            backLink="/admin/members"
            backText="Üye Yönetimi Listesine Dön"
            embedded={true}
        />
    );
}
