import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getEmailTemplate } from '@/lib/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);
const FALLBACK_ADMIN_EMAIL = 'info@gyiad.com';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { subject, message } = body;

        if (!subject || !message) {
            return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
        }

        // 1. Insert Request
        const { data, error } = await supabase
            .from('requests')
            .insert({
                user_id: user.id,
                subject,
                message,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        // 2. Fetch User Profile for Email Details
        const { data: profile } = await supabase
            .from('members')
            .select('full_name, email')
            .eq('id', user.id)
            .single();

        // Check API Key
        if (!process.env.RESEND_API_KEY) {
            console.error("RESEND_API_KEY is not set!");
            return NextResponse.json({
                success: true,
                data,
                emailSent: false,
                emailError: "RESEND_API_KEY is missing in environment variables",
            });
        }

        // 3. Fetch Admin Emails and Executive Board Emails (Separate queries for safety)
        const { data: admins, error: adminError } = await supabase
            .from('members')
            .select('email')
            .eq('is_admin', true);

        if (adminError) console.error("Error fetching admins:", adminError);

        const { data: executives, error: execError } = await supabase
            .from('members')
            .select('email')
            .contains('board_roles', ['executive_board']);

        if (execError) console.error("Error fetching executives:", execError);

        const adminEmails = admins?.map(m => m.email).filter(Boolean) || [];
        const executiveEmails = executives?.map(m => m.email).filter(Boolean) || [];

        // Deduplicate logic
        const uniqueAdminEmails = [...new Set(adminEmails)];
        const uniqueExecEmails = [...new Set(executiveEmails)];

        // TO: Admins (using unique list)
        // If admins list is empty after fetch, we fallback to hardcoded admin email
        const toRecipients = uniqueAdminEmails.length > 0 ? uniqueAdminEmails : [FALLBACK_ADMIN_EMAIL];

        // CC: Executive Board (excluding those who are already in TO list)
        const ccRecipients = uniqueExecEmails.filter(email => !toRecipients.includes(email));

        // 4. Send Notification Email to Admin(s)
        try {
            const emailHtml = getEmailTemplate(
                'Yeni Üye Talebi',
                `
                <p><strong>Talep Eden:</strong> ${profile?.full_name || 'Bilinmeyen'} (${user.email})</p>
                <p><strong>Konu:</strong> ${subject}</p>
                
                <div style="background: white; padding: 20px; border-radius: 5px; border: 1px solid #eee; margin: 20px 0;">
                    <p style="margin-top: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Mesaj İçeriği</p>
                    <p style="font-style: italic; color: #333;">"${message}"</p>
                </div>
                `,
                'Admin Paneline Git',
                `https://gyiad.vercel.app/login`
            );

            await resend.emails.send({
                from: 'GYİAD <noreply@gyiad.org.tr>',
                to: toRecipients,
                cc: ccRecipients,
                subject: `📝 Yeni Talep: ${subject}`,
                html: emailHtml
            });
            console.log("Admin notification sent to:", toRecipients, "CC:", ccRecipients);
        } catch (emailError) {
            console.error("Failed to send admin notification:", emailError);
            return NextResponse.json({
                success: true,
                data,
                emailSent: false,
                emailError: emailError instanceof Error ? emailError.message : String(emailError),
                debug: { to: toRecipients, cc: ccRecipients }
            });
        }

        return NextResponse.json({
            success: true,
            data,
            emailSent: true,
            debug: { to: toRecipients, cc: ccRecipients }
        });

    } catch (error: any) {
        console.error("Request creation error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
