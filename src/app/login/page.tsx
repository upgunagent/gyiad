'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { memberService } from '@/services/memberService';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) throw signInError;

            if (data.user) {
                // Check if admin
                const profile = await memberService.getProfile(data.user.id);
                // Check for is_admin flag. Note: getProfile returns DbMember which might need updating to include is_admin if not already there.
                // For now, let's assume we redirect to profile, or if we can fetch isAdmin.
                // We'll trust the profile fetch or a separate check. 

                // Let's do a quick direct check for admin just in case generic profile doesn't have it explicitly typed yet
                const { data: memberData } = await supabase
                    .from('members')
                    .select('is_admin')
                    .eq('id', data.user.id)
                    .single();

                if (memberData?.is_admin) {
                    router.push('/admin');
                } else {
                    router.push('/profile');
                }
            }
        } catch (err: any) {
            // Only log unexpected errors to avoid triggering Next.js error overlay for invalid credentials
            if (err.message !== 'Invalid login credentials') {
                console.error("Login error:", err);
            }
            setError(err.message || 'Giriş yapılırken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0099CC]">
            {/* Left Side - Visual & Branding (Now White BG, Blue Text) */}
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
                    <h1 className="text-4xl font-bold mb-6 text-gray-900">GYİAD Üye Platformuna Hoş Geldiniz</h1>
                    <p className="text-gray-600 mb-8 max-w-md">
                        Genç Yönetici ve İş İnsanları Derneği üyeleri için özel olarak tasarlanmıştır.
                        <br />
                        <a href="https://gyiad.org.tr" target="_blank" rel="noopener noreferrer" className="text-[#0099CC] hover:underline mt-2 inline-block">
                            https://gyiad.org.tr
                        </a>
                        <br />
                        <a href="https://www.gyiaduyeler.org" target="_blank" rel="noopener noreferrer" className="text-[#0099CC] hover:underline mt-1 inline-block">
                            https://www.gyiaduyeler.org
                        </a>
                    </p>
                    <div className="flex gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#0099CC]" />
                            <span>Üyelik</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#0099CC]" />
                            <span>İletişim</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#0099CC]" />
                            <span>Networking</span>
                        </div>
                    </div>
                </div>
                {/* Decorative Circles (Subtle gray/blue) */}
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#0099CC]/5 rounded-full blur-3xl z-0" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0099CC]/5 rounded-full blur-3xl z-0" />
            </div>

            {/* Right Side - Login Form (Now Blue BG) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0099CC]">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-white/20">
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
                        <h2 className="text-2xl font-bold text-gray-900">Giriş Yap</h2>
                        <p className="text-sm text-gray-500 mt-2">Hesabınıza erişmek için bilgilerinizi giriniz</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-center gap-2">
                            <span className="font-bold">Hata:</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">E-Posta Adresi</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                                placeholder="ornek@sirket.com"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700">Şifre</label>
                                <Link href="/forgot-password" className="text-xs text-[#0099CC] hover:underline font-medium">
                                    Şifremi Unuttum?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#0099CC] hover:bg-[#007da6] text-white font-bold py-3.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#0099CC]/20"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Giriş Yapılıyor...
                                </>
                            ) : (
                                <>
                                    Giriş Yap
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500">
                            Üyelik işlemleri için lütfen GYİAD yetkilisi ile iletişime geçin.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
