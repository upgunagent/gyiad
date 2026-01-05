import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json({ error: 'E-posta ve kod gerekli' }, { status: 400 });
        }

        // Check code
        const { data: member, error } = await supabaseAdmin
            .from('members')
            .select('id, reset_code, reset_expires_at')
            .eq('email', email)
            .single();

        if (error || !member) {
            return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
        }

        // Verify logic
        if (member.reset_code !== code) {
            return NextResponse.json({ error: 'Hatalı kod, lütfen kontrol edip tekrar deneyin.' }, { status: 400 });
        }

        if (new Date(member.reset_expires_at) < new Date()) {
            return NextResponse.json({ error: 'Kodun süresi dolmuş. Lütfen yeni kod isteyin.' }, { status: 400 });
        }

        // Code is valid
        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
