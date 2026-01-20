import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Use Service Role Key for Admin privileges (bypassing RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            full_name,
            email,
            phone,
            membership_category,
            membership_status,
            membership_start_date,
            membership_end_date,
            board_roles,
            card_role,
            // New Fields
            company_name,
            company_address,
            position,
            sector,
            birth_date,
            marital_status,
            gender,
            linkedin_url,
            websites,
            education,
            languages,
            other_memberships,
            gyiad_projects
        } = body;

        console.log("Create Member Request:", { email, full_name, board_roles, card_role });

        const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";

        // 1. Create User
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: full_name }
        });

        if (userError) throw userError;
        if (!userData.user) throw new Error("Kullanıcı oluşturulamadı.");

        const userId = userData.user.id;

        // 2. Insert Profile (Bypassing RLS with service role)
        const { error: profileError } = await supabaseAdmin
            .from('members')
            .upsert({
                id: userId,
                email: email,
                full_name: full_name,
                phone: phone,
                membership_category: membership_category,
                member_type: membership_status, // Map frontend 'status' to DB 'member_type'
                membership_date: membership_start_date, // Map start to DB 'membership_date'
                membership_end_date: membership_end_date || null,
                board_roles: Array.isArray(board_roles) ? board_roles : [],
                is_admin: false,
                // New Fields Mapped
                company_name: company_name || null,
                company_address: company_address || null,
                position: position || null,
                sector: sector || null,
                birth_date: birth_date || null,
                marital_status: marital_status || 'single',
                gender: gender || null,
                linkedin_url: linkedin_url || null,
                websites: Array.isArray(websites) ? websites.filter(Boolean) : [],
                education: Array.isArray(education) ? education : [],
                languages: Array.isArray(languages) ? languages : [],
                other_memberships: other_memberships || null,
                gyiad_projects: gyiad_projects || null,
                card_role: card_role || null
            });

        if (profileError) {
            console.error("Profile insert error", profileError);
            await supabaseAdmin.auth.admin.deleteUser(userId); // Cleanup
            throw profileError;
        }

        // 3. Send Email
        console.log("Attempting to send email via Resend...");
        const emailResponse = await resend.emails.send({
            from: 'GYİAD <noreply@gyiad.org.tr>',
            to: [email],
            subject: 'GYİAD Üyeliğiniz Oluşturuldu',
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
                        <h2 style="color: #0099CC; margin-top: 0;">GYİAD Üyeliğiniz Oluşturuldu</h2>
                        
                        <p>Giyad tarafından Üye kaydınız gerçekleşti.</p>
                        
                        <p>Lütfen aşağıdaki kullanıcı adı ve şifreniz ile giriş yapıp profil bilgilerinizi tamamlayınız ve şifrenizi güncelleyiniz.</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 5px; border: 1px solid #eee; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Kullanıcı Adı:</strong> ${email}</p>
                            <p style="margin: 5px 0;"><strong>Şifre:</strong> ${tempPassword}</p>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://gyiad.vercel.app/login" 
                               style="background: #0099CC; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                                Giriş Yap
                            </a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        
                        <p style="color: #999; font-size: 12px; text-align: center;">
                            © ${new Date().getFullYear()} GYİAD - Tüm hakları saklıdır.<br>
                            Bu otomatik bir e-postadır, lütfen yanıtlamayın.
                        </p>
                    </div>
                </body>
                </html>
            `
        });

        if (emailResponse.error) {
            console.error("Resend Email Error:", emailResponse.error);
            return NextResponse.json({
                success: true,
                warning: "Kullanıcı oluşturuldu ANCAK e-posta gönderilemedi. Hata: " + emailResponse.error.message,
                tempPassword
            });
        }

        console.log("Email sent successfully:", emailResponse.data);

        return NextResponse.json({ success: true, userId });

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
