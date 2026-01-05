import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getEmailTemplate } from '@/lib/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // We need member details too
        const { data, error } = await supabase
            .from('requests')
            .select(`
                *,
                members:user_id ( full_name, email, avatar_url )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const supabase = await createClient(); // Ensure this is awaited

        const body = await request.json();
        const { id, reply } = body;

        if (!id || !reply) {
            return NextResponse.json({ error: 'ID and reply are required' }, { status: 400 });
        }

        // Update Request
        const { data, error } = await supabase
            .from('requests')
            .update({
                admin_reply: reply,
                status: 'replied',
                replied_at: new Date().toISOString()
            })
            .eq('id', id)
            .select(`
                *,
                members:user_id ( full_name, email, push_token )
            `)
            .single();

        if (error) throw error;

        // Send Email to User
        const member = data.members as any; // Type assertion since it's joined
        if (member?.email) {
            try {
                const emailHtml = getEmailTemplate(
                    'Talebiniz Yanıtlandı',
                    `
                    <p>Sn. <strong>${member.full_name}</strong>,</p>
                    <p>Derneğimize iletmiş olduğunuz talebiniz yönetim kurulumuz tarafından incelenmiş ve yanıtlanmıştır.</p>
                    
                    <div style="margin: 20px 0;">
                        <p><strong>Konu:</strong> ${data.subject}</p>
                        <p><strong>Mesajınız:</strong> ${data.message}</p>
                    </div>

                    <div style="background: #e6fffa; padding: 20px; border-radius: 5px; border-left: 4px solid #00b341; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #00b341; font-size: 14px; text-transform: uppercase;">Yönetim Cevabı</h3>
                        <p style="color: #333;">${reply}</p>
                    </div>
                    `,
                    'Taleplerim Sayfasına Git',
                    `https://gyiad.vercel.app/login`
                );

                await resend.emails.send({
                    from: 'GYİAD <noreply@getmekan.com>',
                    to: [member.email],
                    subject: '✅ Talebiniz Yanıtlandı',
                    html: emailHtml
                });
                console.log("Reply email sent to:", member.email);
            } catch (e) {
                console.error("Failed to send reply email", e);
            }
        }

        // *** PUSH NOTIFICATION LOGIC ***
        if (member?.push_token) {
            try {
                const response = await fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: member.push_token,
                        sound: 'default',
                        title: 'Talebiniz Yanıtlandı',
                        body: 'GYİAD Yöneticisi talebinize cevap verdi. Görüntülemek için dokunun.',
                        data: { requestId: id },
                    }),
                });
                const result = await response.json();
                console.log("Push notification sent to:", member.push_token);
                console.log("Expo API Response:", JSON.stringify(result));
            } catch (e) {
                console.error("Failed to send push notification", e);
            }
        }

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}



export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('requests')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
