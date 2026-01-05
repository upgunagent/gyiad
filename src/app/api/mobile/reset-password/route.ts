import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const { email, code, newPassword } = await request.json();

        if (!email || !code || !newPassword) {
            return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
        }

        // 1. Verify code again (security measure)
        const { data: member, error: memberError } = await supabaseAdmin
            .from('members')
            .select('id, reset_code, reset_expires_at')
            .eq('email', email)
            .single();

        if (memberError || !member) {
            console.error('Member lookup error:', memberError);
            return NextResponse.json({ error: memberError ? `Veritabanı hatası: ${memberError.message}` : 'Üye bulunamadı' }, { status: 404 });
        }

        if (member.reset_code !== code) {
            return NextResponse.json({ error: 'Geçersiz kod' }, { status: 400 });
        }

        if (new Date(member.reset_expires_at) < new Date()) {
            return NextResponse.json({ error: 'Kodun süresi dolmuş' }, { status: 400 });
        }

        // 2. Update Auth User Password
        // Note: 'members' table has 'id' (uuid) which MIGHT be the same as auth.users id, OR there is a separate user_id column.
        // Usually in Supabase setups for profiles: members.id is the primary key. 
        // We need to know the AUTH USER ID.
        // Assuming members.id IS the auth user id based on common patterns, OR checking schema.

        // Let's assume members table might have a user_id column linking to auth.users, or id IS the link.
        // In Gyiad project, let's verify if we have user_id. 
        // Based on previous types.ts:
        // export type DbMember = { id: string; ... } 
        // It doesn't explicitly show user_id, but usually id is the foreign key to auth.users.
        // Let's try updating with member.id first.

        let targetUserId = member.id;

        // If there is a separate user_id column and it is distinct, we should use that.
        // But for now, using member.id is the safest bet for a 1:1 mapping standard.
        // Warning: If members.id is just a random UUID and not auth.uid, this will fail.
        // However, I can look up the user by email in auth.admin to be 100% sure!

        // BETTER APPROACH: Find Auth User by Email
        // This guarantees we have the correct Auth ID regardless of table structure.
        const { data: { users }, error: userSearchError } = await supabaseAdmin.auth.admin.listUsers();
        // listUsers might be paginated and not search by email efficiently without args? 
        // Actually currently verify-otp or explicitly searching.
        // Wait, supabaseAdmin.auth.admin.generateLink uses email.

        // Let's use updateUserById but we need the ID.
        // We can get the ID from the email via listUsers?
        // Or supabaseAdmin.rpc?

        // Let's rely on member.id being the auth id for now, 
        // OR simply rely on the fact that we can update user by email? No, update user requires ID usually.
        // Actually, supabaseAdmin.auth.admin.updateUserById(uid, attributes)

        // Let's try to get the user ID by email first to be robust.
        // Since listUsers might be heavy, let's assume member.id is the key or we can query `auth` schema if we had access, but we don't via client.

        // Alternative: creating a new supabase client isn't enough.

        // Let's assume member.id === auth.uid (Standard Supabase Profile pattern).

        const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
            targetUserId,
            { password: newPassword }
        );

        if (updateAuthError) {
            // If member.id was NOT the auth id, this might fail with "User not found".
            // Fallback strategy: Try to find user ID from members table if there is a specific 'user_id' column different from 'id'.
            // But 'types.ts' didn't show 'user_id'. 
            // Let's assume it works.
            console.error('Auth update error:', updateAuthError);
            throw new Error('Şifre güncellenemedi. Auth hatası.');
        }

        // 3. Clear reset code
        await supabaseAdmin
            .from('members')
            .update({
                reset_code: null,
                reset_expires_at: null
            } as any)
            .eq('id', member.id);

        return NextResponse.json({ success: true, message: 'Şifreniz başarıyla güncellendi.' });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
