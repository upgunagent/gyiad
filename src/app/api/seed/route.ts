import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
// Service Role client for Admin access
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function GET(request: Request) {
    try {
        console.log("Starting Seed Process...");
        // 1. Clean existing members
        const { error: deleteError } = await supabaseAdmin
            .from('members')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (unsafe for huge tables but fine for demo)
        if (deleteError) {
            console.error("Delete members error:", deleteError);
            // Ignore error, might be empty
        }
        // 2. Define Demo Users
        const demoUsers = [
            {
                email: 'ahmet@yilmaz.com',
                password: 'password123',
                profile: {
                    full_name: 'Ahmet Yılmaz',
                    company_name: 'Yılmaz Holding',
                    position: 'Yönetim Kurulu Başkanı',
                    sector: 'Enerji',
                    membership_category: 'corporate',
                    member_type: 'active',
                    membership_start_date: '2020-01-01',
                    board_roles: ['president', 'board_member'],
                    gyiad_projects: 'Enerji Çalışma Grubu'
                }
            },
            {
                email: 'ayse@tech.com',
                password: 'password123',
                profile: {
                    full_name: 'Ayşe Demir',
                    company_name: 'Tech Solutions',
                    position: 'CEO',
                    sector: 'Teknoloji',
                    membership_category: 'individual',
                    member_type: 'active',
                    membership_start_date: '2021-05-15',
                    board_roles: ['vice_president', 'executive_board', 'board_member'],
                    gyiad_projects: 'Dijital Dönüşüm'
                }
            },
            {
                email: 'mehmet@oz.com',
                password: 'password123',
                profile: {
                    full_name: 'Mehmet Öz',
                    company_name: 'Öz Lojistik',
                    position: 'Genel Müdür',
                    sector: 'Lojistik',
                    membership_category: 'corporate',
                    member_type: 'active',
                    membership_start_date: '2019-11-20',
                    board_roles: ['board_member'],
                    gyiad_projects: 'Lojistik Komitesi'
                }
            },
            {
                email: 'zeynep@kaya.com',
                password: 'password123',
                profile: {
                    full_name: 'Zeynep Kaya',
                    company_name: 'Kaya Giyim',
                    position: 'CFO',
                    sector: 'Tekstil',
                    membership_category: 'individual',
                    member_type: 'active',
                    membership_start_date: '2022-02-10',
                    board_roles: ['audit_board'],
                    gyiad_projects: 'Mali İşler'
                }
            },
            {
                email: 'ali@vural.com',
                password: 'password123',
                profile: {
                    full_name: 'Ali Vural',
                    company_name: 'Vural Enerji',
                    position: 'Onursal Başkan',
                    sector: 'Enerji',
                    membership_category: 'individual',
                    member_type: 'honorary',
                    membership_start_date: '2010-01-01',
                    board_roles: ['honorary_member'], // Optional tag
                    gyiad_projects: 'Danışma Kurulu'
                }
            },
            {
                email: 'fatma@sahin.com',
                password: 'password123',
                profile: {
                    full_name: 'Fatma Şahin',
                    company_name: 'Şahin Group',
                    position: 'Yönetim Kurulu Başkanı',
                    sector: 'İnşaat',
                    membership_category: 'corporate',
                    member_type: 'active',
                    membership_start_date: '2000-01-01',
                    board_roles: ['high_advisory_board', 'founder', 'past_president'],
                    gyiad_projects: 'Kurucu Heyet'
                }
            },
            {
                email: 'gizli@kisi.com',
                password: 'password123',
                profile: {
                    full_name: 'Gizli Kişi',
                    company_name: 'Eski Şirket',
                    position: 'Eski Müdür',
                    sector: 'Bilinmiyor',
                    membership_category: 'individual',
                    member_type: 'left',
                    membership_start_date: '2023-01-01',
                    board_roles: [],
                    gyiad_projects: ''
                }
            }
        ];
        const results = [];
        // 3. Create Users loop
        for (const user of demoUsers) {
            let userId: string | undefined;
            const { data: createdData, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: user.email,
                password: user.password,
                email_confirm: true,
                user_metadata: { full_name: user.profile.full_name }
            });
            if (createError) {
                console.log(`User ${user.email} creation failed (likely exists). Fetching ID...`);
                const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
                const existing = (users as any[]).find(u => u.email === user.email);
                if (existing) {
                    userId = existing.id;
                    await supabaseAdmin.auth.admin.updateUserById(userId!, { password: user.password });
                } else {
                    console.error("Could not find user after creation error", createError);
                    continue;
                }
            } else {
                userId = createdData.user.id;
            }
            if (!userId) continue;
            const { error: profileError } = await supabaseAdmin
                .from('members')
                .upsert({
                    id: userId,
                    email: user.email,
                    ...user.profile
                });
            if (profileError) {
                console.error(`Profile upsert failed for ${user.email}`, profileError);
                results.push({ email: user.email, status: 'failed', error: profileError.message });
            } else {
                results.push({ email: user.email, status: 'success' });
            }
        }
        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}