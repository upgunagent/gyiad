import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Service role client needed to update user data without RLS restrictions
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'E-posta adresi gerekli' }, { status: 400 });
        }

        // 1. Check if user exists in members table
        const { data: member, error: memberError } = await supabaseAdmin
            .from('members')
            .select('id, email')
            .eq('email', email)
            .single();

        if (memberError || !member) {
            // Return success even if not found to prevent user enumeration (security best practice)
            // But for this internal app, maybe explicit error is better for UX? 
            // Let's return error for now as it seems to be an internal community app.
            return NextResponse.json({ error: 'Bu e-posta adresiyle kayıtlı üye bulunamadı.' }, { status: 404 });
        }

        // 2. Generate 4-digit code
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

        // 3. Save code to members table
        const { error: updateError } = await supabaseAdmin
            .from('members')
            .update({
                reset_code: code,
                reset_expires_at: expiresAt
            } as any) // Type assertion until types are updated
            .eq('id', member.id);

        if (updateError) {
            console.error('Update Code Error:', updateError);
            throw new Error('Kod oluşturulurken bir hata oluştu.');
        }

        // 4. Send Email
        const { error: emailError } = await resend.emails.send({
            from: 'GYİAD <noreply@gyiad.org.tr>',
            to: [email],
            subject: 'GYİAD - Şifre Sıfırlama Kodu',
            html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <div style="max-width: 500px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 10px; border: 1px solid #eee;">
                        <h2 style="color: #0099CC; text-align: center;">Şifre Sıfırlama</h2>
                        <p>Merhaba,</p>
                        <p>GYİAD mobil uygulaması için şifre sıfırlama talebinde bulundunuz.</p>
                        <p>Doğrulama kodunuz:</p>
                        <div style="background: #f0f8ff; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0099CC; border-radius: 5px; margin: 20px 0;">
                            ${code}
                        </div>
                        <p>Bu kod 15 dakika süreyle geçerlidir.</p>
                    </div>
                </body>
                </html>
            `
        });

        if (emailError) {
            console.error('Resend Error:', emailError);
            throw new Error('E-posta gönderilemedi.');
        }

        return NextResponse.json({ success: true, message: 'Doğrulama kodu gönderildi.' });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
