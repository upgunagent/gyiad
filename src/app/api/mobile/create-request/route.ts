import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getEmailTemplate } from '@/lib/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);
const FALLBACK_ADMIN_EMAIL = 'gyiad@gyiad.org.tr';

// Initialize Supabase Admin client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const { userId, subject, message } = await request.json();

        if (!userId || !subject || !message) {
            return NextResponse.json({ error: 'Eksik bilgi: userId, konu ve mesaj gereklidir.' }, { status: 400 });
        }

        // 1. Insert Request into Database
        const { data: requestData, error: requestError } = await supabaseAdmin
            .from('requests')
            .insert({
                user_id: userId,
                subject,
                message,
                status: 'pending'
            })
            .select()
            .single();

        if (requestError) {
            console.error('Request insert error:', requestError);
            throw new Error(`Talep kaydedilemedi: ${requestError.message}`);
        }

        // 2. Fetch User Profile for Email
        const { data: profile } = await supabaseAdmin
            .from('members')
            .select('full_name, email')
            .eq('id', userId)
            .single();

        // 3. Fetch Admin Emails
        const { data: admins } = await supabaseAdmin
            .from('members')
            .select('email')
            .eq('is_admin', true);

        // 4. Fetch Executive Board Emails
        const { data: executives } = await supabaseAdmin
            .from('members')
            .select('email')
            .contains('board_roles', ['executive_board']);

        const adminEmails = admins?.map(m => m.email).filter(Boolean) || [];
        const executiveEmails = executives?.map(m => m.email).filter(Boolean) || [];

        const uniqueAdminEmails = [...new Set(adminEmails)];
        const uniqueExecEmails = [...new Set(executiveEmails)];

        const toRecipients = uniqueAdminEmails.length > 0 ? uniqueAdminEmails : [FALLBACK_ADMIN_EMAIL];
        const ccRecipients = uniqueExecEmails.filter(email => !toRecipients.includes(email));

        // 5. Send Email via Resend
        if (process.env.RESEND_API_KEY) {
            try {
                const emailHtml = getEmailTemplate(
                    'Yeni Mobil Üye Talebi',
                    `
                    <p><strong>Talep Eden:</strong> ${profile?.full_name || 'Bilinmeyen'} (${profile?.email || '-'}) (Mobil)</p>
                    <p><strong>Konu:</strong> ${subject}</p>
                    <div style="background: white; padding: 20px; border-radius: 5px; border: 1px solid #eee; margin: 20px 0;">
                        <p style="margin-top: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Mesaj İçeriği</p>
                        <p style="font-style: italic; color: #333;">"${message}"</p>
                    </div>
                    `,
                    'Admin Paneline Git',
                    'https://www.gyiaduyeler.org.tr/login'
                );

                await resend.emails.send({
                    from: 'GYİAD <noreply@gyiad.org.tr>',
                    to: toRecipients,
                    cc: ccRecipients,
                    subject: `📱 Yeni Mobil Talep: ${subject}`,
                    html: emailHtml
                });
            } catch (emailErr) {
                console.error('Email send error:', emailErr);
                // We don't fail the request if email fails, but we log it.
            }
        }

        return NextResponse.json({ success: true, data: requestData });

    } catch (error: any) {
        console.error('Create request error:', error);
        return NextResponse.json({ error: error.message || 'Bir hata oluştu' }, { status: 500 });
    }
}
