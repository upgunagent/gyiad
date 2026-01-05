# Resend API Key Gerekli

Şifre sıfırlama e-postaları için Resend servisini kullanabilmek için `.env.local` dosyanıza aşağıdaki değişkeni eklemeniz gerekmektedir:

```env
RESEND_API_KEY=your_resend_api_key_here
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Resend Kurulumu

1. [Resend.com](https://resend.com) adresinden hesap oluşturun
2. **API Keys** bölümünden yeni bir API key oluşturun
3. **Domains** bölümünden `getmekan.com` domain'ini ekleyin ve DNS kayıtlarını yapılandırın
4. DNS kayıtları doğrulandıktan sonra e-posta göndermeye hazır olacaksınız

## DNS Kayıtları

Resend için aşağıdaki DNS kayıtlarını getmekan.com domain'inize eklemeniz gerekecek:

- SPF Record (TXT)
- DKIM Records (TXT)
- DMARC Record (TXT)

Bu kayıtlar Resend dashboard'unda gösterilecektir.

## Gönderen E-posta Adresi

E-postalar `noreply@getmekan.com` adresinden gönderilecektir.
