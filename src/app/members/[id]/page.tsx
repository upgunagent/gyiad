import { notFound } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { mockMembers } from '@/data/mock-members';
import { createClient } from '@/lib/supabase/server';
import MemberProfileView from '@/components/MemberProfileView';

export default async function MemberDetailPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { id } = await params;
    const { filter } = await searchParams;

    // Try to fetch from Supabase
    const supabase = await createClient();
    let member: any;

    // Check if ID is a valid UUID (Supabase ID)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUuid) {
        const { data } = await supabase.from('members').select('*').eq('id', id).single();
        if (data) {
            member = data;
            // Privacy: Remove sensitive fields for public view
            delete member.company_turnover;
            delete member.number_of_employees;
        }
    }

    // Fallback to mock data if not found or not UUID (for old mock links)
    if (!member) {
        member = mockMembers.find(m => m.id === id);
    }

    if (!member) {
        notFound();
    }

    // Determine Back Link
    const backLink = filter ? `/?filter=${filter}` : '/';

    // Optional: Dynamic Text based on filter
    const getBackText = (f: string) => {
        const map: Record<string, string> = {
            'active': 'Aktif Üyeler Listesine Dön',
            'honorary': 'Fahri Üyeler Listesine Dön',
            'president': 'Başkan Sayfasına Dön',
            // ... add others if needed
        };
        return map[f as string] || 'Üye Listesine Dön';
    };

    const backText = filter ? getBackText(filter as string) : 'Üye Listesine Dön';

    return (
        <MemberProfileView
            member={member}
            backLink={backLink}
            backText={backText}
            sidebar={<Sidebar />}
        />
    );
}
