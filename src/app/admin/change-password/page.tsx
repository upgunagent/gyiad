'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminChangePasswordPage() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Yeni şifreler eşleşmiyor');
            return;
        }

        if (newPassword.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır');
            return;
        }

        setIsLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setSuccess('Şifreniz başarıyla değiştirildi');
            setTimeout(() => {
                router.push('/admin');
            }, 2000);
        } catch (error: any) {
            setError(error.message || 'Şifre değiştirme başarısız oldu');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar />

            <main className="flex-1 ml-72 overflow-y-auto">
                <div className="max-w-2xl mx-auto p-8">
                    <div className="mb-6">
                        <Link
                            href="/admin"
                            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Geri Dön
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Şifre Değiştir</h1>
                        <p className="text-gray-500">Admin hesap şifrenizi güncelleyin</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Yeni Şifre
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-transparent outline-none"
                                        placeholder="En az 6 karakter"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Yeni Şifre (Tekrar)
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-transparent outline-none"
                                        placeholder="Şifrenizi tekrar girin"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                                    {success}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full px-6 py-3 bg-[#0099CC] text-white rounded-lg hover:bg-[#007da6] transition-colors disabled:opacity-50 font-medium"
                            >
                                {isLoading ? 'Kaydediliyor...' : 'Şifreyi Değiştir'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
