import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Create a Supabase client with the service role key for admin operations
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

        // Generate password reset link using Supabase Admin API
        // We use 'magiclink' instead of 'recovery' to prevent Supabase from sending a default recovery email
        // formatting the link manually if needed, but generateLink returns the full action_link
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
            options: {
                redirectTo: `https://www.gyiaduyeler.org.tr/reset-password`,
            }
        });

        if (error) {
            throw error;
        }

        // The action_link contains the token and everything needed
        const resetLink = data.properties?.action_link;

        if (!resetLink) {
            throw new Error('Şifre sıfırlama bağlantısı oluşturulamadı.');
        }

        // Send email via Resend
        const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'GYİAD <noreply@gyiad.org.tr>',
            to: [email],
            subject: 'GYİAD - Şifre Sıfırlama',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #0099CC 0%, #007da6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">GYİAD</h1>
                        <p style="color: white; margin: 10px 0 0 0;">Genç Yönetici ve İş İnsanları Derneği</p>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #0099CC; margin-top: 0;">Şifre Sıfırlama Talebi</h2>
                        
                        <p>Merhaba,</p>
                        
                        <p>GYİAD Üye Platformu için şifre sıfırlama talebinde bulundunuz. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" 
                               style="background: #0099CC; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                                Şifremi Sıfırla
                            </a>
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">
                            Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz. Şifreniz değiştirilmeyecektir.
                        </p>
                        
                        <p style="color: #666; font-size: 14px;">
                            Bu link 24 saat boyunca geçerlidir.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        
                        <p style="color: #999; font-size: 12px; text-align: center;">
                            © 2024 GYİAD - Tüm hakları saklıdır.<br>
                            Bu otomatik bir e-postadır, lütfen yanıtlamayın.
                        </p>
                    </div>
                </body>
                </html>
            `,
        });

        if (emailError) {
            console.error('Resend error:', emailError);
            throw emailError;
        }

        return NextResponse.json({ success: true, message: 'Şifre sıfırlama e-postası gönderildi' });
    } catch (error: any) {
        console.error('Password reset error:', error);
        return NextResponse.json({ error: error.message || 'E-posta gönderilemedi' }, { status: 500 });
    }
}
