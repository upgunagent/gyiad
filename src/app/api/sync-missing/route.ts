import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
    try {
        console.log("Syncing missing users...");
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        const results = [];

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 500 });
        }

        // 2. Get All Existing Member IDs
        const { data: members, error: dbError } = await supabaseAdmin
            .from('members')
            .select('id');

        if (dbError) {
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }

        const existingMemberIds = new Set(members?.map(m => m.id));

        // 3. Find missing users
        const missingUsers = (users || []).filter(u => !existingMemberIds.has(u.id));
        console.log(`Found ${missingUsers.length} missing users.`);

        // 4. Insert into Members
        for (const user of missingUsers) {
            const { error: upsertError } = await supabaseAdmin
                .from('members')
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                    // We can default to 'active' or 'new' depending on logic.
                    // Let's use 'active' so they show up, and mark them as 'Individual' (Bireysel) by default.
                    member_type: 'active',
                    company_name: '-',
                    position: 'Üye',
                    membership_date: new Date().toISOString(),
                    membership_category: 'individual'
                });

            if (upsertError) {
                console.error(`Failed to sync ${user.email}`, upsertError);
                results.push({ email: user.email, status: 'failed', error: upsertError.message });
            } else {
                results.push({ email: user.email, status: 'synced' });
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
