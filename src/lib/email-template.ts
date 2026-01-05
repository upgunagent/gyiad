
export const getEmailTemplate = (title: string, content: string, actionText?: string, actionUrl?: string) => `
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
        <h2 style="color: #0099CC; margin-top: 0;">${title}</h2>
        
        ${content}
        
        ${actionText && actionUrl ? `
        <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}" 
               style="background: #0099CC; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                ${actionText}
            </a>
        </div>
        ` : ''}
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} GYİAD - Tüm hakları saklıdır.<br>
            Bu otomatik bir e-postadır, lütfen yanıtlamayın.
        </p>
    </div>
</body>
</html>
`;
