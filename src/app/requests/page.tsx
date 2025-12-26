'use client';

import Sidebar from '@/components/Sidebar';
import { useState, useEffect, Suspense } from 'react';
import { Send, MessageSquare, Clock, CheckCircle } from 'lucide-react';

type RequestItem = {
    id: string;
    subject: string;
    message: string;
    status: 'pending' | 'replied';
    admin_reply?: string;
    created_at: string;
    replied_at?: string;
};

export default function Page() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <RequestsPage />
        </Suspense>
    );
}

function RequestsPage() {
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const res = await fetch('/api/requests');
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, message }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Gönderim başarısız');
            }

            setSubject('');
            setMessage('');
            loadRequests(); // Reload list
            alert('Talebiniz başarıyla iletildi.');
        } catch (error: any) {
            console.error(error);
            alert('Hata: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-72 p-4 md:p-12 overflow-y-auto transition-all duration-300">
                <div className="max-w-4xl mx-auto">

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Dilek ve Talepler</h1>
                    <p className="text-gray-500 mb-8">Derneğimiz ile ilgili görüş, öneri ve taleplerinizi buradan iletebilirsiniz.</p>

                    <div className="flex flex-col gap-8">
                        {/* Top: New Request Form */}
                        <div className="w-full">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="font-semibold text-gray-800 mb-6 flex items-center gap-2 text-lg">
                                    <Send className="w-5 h-5 text-[#0099CC]" />
                                    Yeni Talep Oluştur
                                </h2>
                                <form onSubmit={handleSubmit} className="md:flex md:gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Konu</label>
                                            <input
                                                type="text"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC]"
                                                placeholder="Örn: Etkinlik Önerisi"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Mesajınız</label>
                                            <textarea
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                required
                                                rows={4}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] resize-none"
                                                placeholder="Detaylı açıklamanız..."
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0 md:w-48 flex items-end">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-[50px] md:h-full bg-[#0099CC] hover:bg-[#007da6] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Gönderiliyor...' : 'Talebi İlet'}
                                            {!isSubmitting && <Send className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Bottom: History */}
                        <div className="w-full space-y-4">
                            <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-lg">
                                <Clock className="w-5 h-5 text-[#0099CC]" />
                                Geçmiş Taleplerim
                            </h2>

                            {isLoading ? (
                                <div className="text-center py-10 text-gray-400">Yükleniyor...</div>
                            ) : requests.length === 0 ? (
                                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
                                    Henüz bir talep oluşturmadınız.
                                </div>
                            ) : (
                                requests.map((req) => (
                                    <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-bold text-gray-900">{req.subject}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${req.status === 'replied'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {req.status === 'replied' ? 'Yanıtlandı' : 'Beklemede'}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm whitespace-pre-wrap">{req.message}</p>
                                            <div className="mt-3 text-xs text-gray-400">
                                                {new Date(req.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>

                                        {/* Reply Section */}
                                        {req.status === 'replied' && req.admin_reply && (
                                            <div className="bg-green-50/50 border-t border-green-100 p-5">
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-green-100 p-2 rounded-full shrink-0">
                                                        <MessageSquare className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-green-700 mb-1 uppercase tracking-wide">YÖNETİM CEVABI</div>
                                                        <p className="text-sm text-gray-700">{req.admin_reply}</p>
                                                        {req.replied_at && (
                                                            <div className="mt-2 text-xs text-gray-400">
                                                                {new Date(req.replied_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
