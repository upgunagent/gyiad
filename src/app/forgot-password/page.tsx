'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/send-reset-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'E-posta gönderilemedi');
            }

            setSuccess(true);
        } catch (err: any) {
            console.error("Password reset error:", err);
            setError(err.message || 'Şifre sıfırlama e-postası gönderilirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0099CC]">
            {/* Left Side - Visual & Branding */}
            <div className="hidden lg:flex w-1/2 bg-white items-center justify-center relative overflow-hidden">
                <div className="relative z-10 p-12 text-[#0099CC] max-w-lg">
                    <div className="w-64 mb-12">
                        <Image
                            src="/logo.png"
                            alt="GYİAD Logo"
                            width={400}
                            height={400}
                            className="w-full h-auto object-contain"
                        />
                    </div>
                    <h1 className="text-4xl font-bold mb-6 text-gray-900">Şifrenizi mi Unuttunuz?</h1>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                    </p>
                </div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#0099CC]/5 rounded-full blur-3xl z-0" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0099CC]/5 rounded-full blur-3xl z-0" />
            </div>

            {/* Right Side - Reset Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0099CC]">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-white/20">
                    <Link
                        href="/login"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Giriş sayfasına dön
                    </Link>

                    <div className="text-center mb-8">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-6">
                            <Image
                                src="/logo.png"
                                alt="GYİAD Logo"
                                width={120}
                                height={120}
                                className="h-20 w-auto object-contain bg-white rounded-lg p-2"
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Şifremi Unuttum</h2>
                        <p className="text-sm text-gray-500 mt-2">
                            {success ? 'E-posta gönderildi!' : 'E-posta adresinizi girin'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-center gap-2">
                            <span className="font-bold">Hata:</span> {error}
                        </div>
                    )}

                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <Mail className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-gray-700">
                                Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi.
                            </p>
                            <p className="text-sm text-gray-500">
                                Lütfen e-posta kutunuzu kontrol edin ve bağlantıya tıklayarak şifrenizi sıfırlayın.
                            </p>
                            <Link
                                href="/login"
                                className="inline-block mt-4 text-[#0099CC] hover:underline font-medium"
                            >
                                Giriş sayfasına dön
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    E-Posta Adresi
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                                    placeholder="ornek@sirket.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#0099CC] hover:bg-[#007da6] text-white font-bold py-3.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#0099CC]/20"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Gönderiliyor...
                                    </>
                                ) : (
                                    'Şifre Sıfırlama Bağlantısı Gönder'
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
