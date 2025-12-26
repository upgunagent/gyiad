import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getEmailTemplate } from '@/lib/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Check admin auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: currentUser } = await supabase
            .from('members')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!currentUser?.is_admin) {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { memberId } = body;

        if (!memberId) {
            return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
        }

        // Fetch Member Details
        const { data: member, error } = await supabase
            .from('members')
            .select('email, full_name')
            .eq('id', memberId)
            .single();

        if (error || !member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        if (!member.email) {
            return NextResponse.json({ error: 'Member has no email address' }, { status: 400 });
        }

        // Construct Corporate Email
        const emailHtml = getEmailTemplate(
            'Üyelik Bilgileri Güncelleme',
            `
            <p>Sn. <strong>${member.full_name}</strong>,</p>
            <p>Derneğimizdeki üyelik kayıtlarınız incelendiğinde, profil bilgilerinizde bazı eksik alanların bulunduğu tespit edilmiştir.</p>
            
            <div style="background: #fff8f0; padding: 20px; border-radius: 5px; border-left: 4px solid #ff9900; margin: 20px 0;">
                <p style="margin: 0; color: #666;">
                    Derneğimizin sunduğu imkanlardan (Networking, Etkinlik Davetleri, vb.) en verimli şekilde faydalanabilmeniz için bilgilerinizi eksiksiz doldurmanız büyük önem taşımaktadır.
                </p>
            </div>

            <p>Lütfen en kısa sürede üye paneline giriş yaparak profilinizi güncelleyiniz.</p>

            <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px;">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #333;">Giriş Bilgileri Hatırlatması:</p>
                <ul style="color: #555; font-size: 14px; padding-left: 20px;">
                    <li><strong>Kullanıcı Adı (Email):</strong> ${member.email}</li>
                    <li><strong>Şifre:</strong> İlk üyelik mailinizde iletilen şifre.</li>
                </ul>
                <p style="margin-top: 10px; font-size: 13px; color: #777;">
                    <em>* Eğer şifrenizi hatırlamıyorsanız, giriş sayfasındaki <strong>"Şifremi Unuttum"</strong> bağlantısını kullanarak mail adresinizle yeni bir şifre oluşturabilirsiniz.</em>
                </p>
            </div>
            `,
            'Profilimi Güncelle',
            `${process.env.NEXT_PUBLIC_SITE_URL}/profile/edit`
        );

        // Send Email
        await resend.emails.send({
            from: 'GYİAD <noreply@getmekan.com>',
            to: [member.email],
            subject: '🔔 Önemli: Üyelik Bilgileri Güncelleme Talebi',
            html: emailHtml
        });

        console.log(`Update request email sent to ${member.email}`);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Failed to send update request:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
