'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const verifySession = async () => {
            console.log("Verify session started");
            try {
                // Helper to parse hash params manually
                const getHashParams = () => {
                    if (typeof window === 'undefined' || !window.location.hash) return {};
                    return window.location.hash.substring(1).split('&').reduce((acc, current) => {
                        const [key, value] = current.split('=');
                        if (key && value) acc[key] = decodeURIComponent(value);
                        return acc;
                    }, {} as Record<string, string>);
                };

                const hashParams = getHashParams();
                console.log("Hash params detected key count:", Object.keys(hashParams).length);

                // 1. If we have tokens in hash, USE THEM IMMEDIATELY. Prioritize this over getSession.
                if (hashParams.access_token && hashParams.refresh_token) {
                    console.log("Tokens found in hash, attempting manual setSession...");
                    const { data: setSessionData, error: setSessionError } = await supabase.auth.setSession({
                        access_token: hashParams.access_token,
                        refresh_token: hashParams.refresh_token,
                    });

                    if (setSessionError) {
                        console.error("Manual setSession failed:", setSessionError);
                        setError(`Oturum açma hatası: ${setSessionError.message}`);
                        setIsVerifying(false);
                        return;
                    }

                    if (setSessionData.session) {
                        console.log("Manual setSession successful user:", setSessionData.session.user.email);
                        setIsVerifying(false);
                        return;
                    } else {
                        console.warn("Manual setSession success but no session returned");
                    }
                }

                // 2. If no tokens in hash, try standard getSession
                console.log("Checking existing session via getSession...");
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (session) {
                    console.log("Existing session found:", session.user.email);
                    setIsVerifying(false);
                    return;
                }

                if (sessionError) {
                    console.error("getSession error:", sessionError);
                }

                // 3. Fallback: Listen for auth changes
                console.log("No session yet, listening for auth state changes...");
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    console.log("Auth state change:", event);
                    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                        if (session) {
                            console.log("Session established via listener");
                            setIsVerifying(false);
                        }
                    }
                });

                // Timeout
                setTimeout(() => {
                    supabase.auth.getSession().then(({ data }) => {
                        if (data.session) {
                            setIsVerifying(false);
                        } else {
                            console.log("Timeout reached, no session.");
                            if (window.location.hash.includes('access_token')) {
                                setError('Bağlantı zaman aşımına uğradı. Token işlenemedi.');
                            } else {
                                setError('Geçersiz bağlantı veya oturum bulunamadı.');
                            }
                            setIsVerifying(false);
                        }
                    });
                }, 5000);

                return () => {
                    subscription.unsubscribe();
                };
            } catch (err: any) {
                console.error('Critical verification error:', err);
                setError(`Beklenmeyen hata: ${err.message || err}`);
                setIsVerifying(false);
            }
        };

        verifySession();
    }, []);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (newPassword !== confirmPassword) {
            setError('Şifreler eşleşmiyor');
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır');
            setIsLoading(false);
            return;
        }

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) throw updateError;

            setSuccess(true);

            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            console.error("Password update error:", err);
            setError(err.message || 'Şifre güncellenirken bir hata oluştu.');
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
                    <h1 className="text-4xl font-bold mb-6 text-gray-900">Yeni Şifre Belirleyin</h1>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        Hesabınız için güvenli bir şifre oluşturun.
                    </p>
                </div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#0099CC]/5 rounded-full blur-3xl z-0" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0099CC]/5 rounded-full blur-3xl z-0" />
            </div>

            {/* Right Side - Reset Form */}
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
                        <h2 className="text-2xl font-bold text-gray-900">Şifre Sıfırlama</h2>
                        <p className="text-sm text-gray-500 mt-2">Yeni şifrenizi belirleyin</p>
                    </div>

                    {isVerifying ? (
                        <div className="text-center py-12">
                            <Loader2 className="w-10 h-10 animate-spin text-[#0099CC] mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Bağlantı Doğrulanıyor...</h3>
                            <p className="text-gray-500 mt-2">Lütfen bekleyin, güvenli oturum açılıyor.</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-center gap-2">
                                    <span className="font-bold">Hata:</span> {error}
                                </div>
                            )}

                            {success ? (
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Şifreniz Değiştirildi!</h3>
                                    <p className="text-gray-600">
                                        Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleResetPassword} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Yeni Şifre
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                                                placeholder="En az 6 karakter"
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

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Yeni Şifre (Tekrar)
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                                                placeholder="Şifrenizi tekrar girin"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                                                Güncelleniyor...
                                            </>
                                        ) : (
                                            'Şifreyi Güncelle'
                                        )}
                                    </button>

                                    <div className="text-center">
                                        <Link
                                            href="/login"
                                            className="text-sm text-gray-500 hover:text-gray-700"
                                        >
                                            Giriş sayfasına dön
                                        </Link>
                                    </div>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
