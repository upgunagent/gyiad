'use client';


import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Search, Clock, Reply, Trash2 } from 'lucide-react';

// ... (in component)



type RequestItem = {
    id: string;
    subject: string;
    message: string;
    status: 'pending' | 'replied';
    admin_reply?: string;
    created_at: string;
    replied_at?: string;
    members?: {
        full_name: string;
        email: string;
        avatar_url?: string;
    };
};

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<RequestItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'replied'>('all');
    const [isLoading, setIsLoading] = useState(true);

    // Reply Modal
    const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        loadRequests();
    }, []);

    useEffect(() => {
        if (!requests.length) return;
        let result = requests;
        if (filter !== 'all') {
            result = result.filter(r => r.status === filter);
        }
        setFilteredRequests(result);
    }, [filter, requests]);

    const handleDelete = async (id: string) => {
        if (!confirm('Bu talebi silmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/admin/requests?id=${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Silme işlemi başarısız');

            setRequests(prev => prev.filter(req => req.id !== id));
            setFilteredRequests(prev => prev.filter(req => req.id !== id));
        } catch (error: any) {
            alert('Hata: ' + error.message);
        }
    };

    const loadRequests = async () => {
        try {
            const res = await fetch('/api/admin/requests');
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
                setFilteredRequests(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest || !replyMessage.trim()) return;

        setIsSending(true);
        try {
            const res = await fetch('/api/admin/requests', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedRequest.id,
                    reply: replyMessage
                })
            });

            if (!res.ok) throw new Error('Cevap gönderilemedi');

            alert('Cevap başarıyla gönderildi ve üyeye email iletildi.');
            setReplyMessage('');
            setSelectedRequest(null);
            loadRequests();

        } catch (error: any) {
            alert('Hata: ' + error.message);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="w-full lg:w-1/2">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dilek ve Talepler (Yönetim)</h1>
                    <p className="text-gray-500">Üyelerden gelen talepleri buradan yönetebilirsiniz.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-white border text-gray-600'}`}
                    >
                        Tümü
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white border text-gray-600'}`}
                    >
                        Bekleyenler
                    </button>
                    <button
                        onClick={() => setFilter('replied')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'replied' ? 'bg-green-600 text-white' : 'bg-white border text-gray-600'}`}
                    >
                        Yanıtlananlar
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-gray-400">Yükleniyor...</div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map((req) => (
                        <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${req.status === 'replied'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {req.status === 'replied' ? 'Yanıtlandı' : 'Beklemede'}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(req.created_at).toLocaleString('tr-TR')}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(req.id)}
                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                        title="Talebi Sil"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">{req.subject}</h3>

                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 overflow-hidden">
                                            {req.members?.avatar_url ? (
                                                <img src={req.members.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                req.members?.full_name?.substring(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{req.members?.full_name}</span>
                                        <span className="text-xs text-gray-400">({req.members?.email})</span>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 text-sm whitespace-pre-wrap w-full">
                                        {req.message}
                                    </div>

                                    {req.admin_reply && (
                                        <div className="mt-4 bg-green-50 border border-green-100 p-4 rounded-lg w-full">
                                            <div className="text-xs font-bold text-green-700 mb-1 uppercase">Sizin Cevabınız:</div>
                                            <p className="text-sm text-gray-800">{req.admin_reply}</p>
                                        </div>
                                    )}
                                </div>

                                {req.status === 'pending' && (
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={() => {
                                                setSelectedRequest(req);
                                                setReplyMessage('');
                                            }}
                                            className="bg-[#0099CC] hover:bg-[#007da6] text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2 text-sm"
                                        >
                                            <Reply className="w-4 h-4" />
                                            Cevapla
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {filteredRequests.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 text-gray-400">
                            Talep bulunamadı.
                        </div>
                    )}
                </div>
            )}

            {/* Reply Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Talebe Cevap Ver</h2>
                        <div className="mb-4 bg-gray-50 p-3 rounded text-sm text-gray-600 max-h-32 overflow-y-auto">
                            <p className="font-bold text-xs mb-1">Talep:</p>
                            {selectedRequest.message}
                        </div>

                        <form onSubmit={handleReply}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cevabınız</label>
                                <textarea
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    required
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]"
                                    placeholder="Üyeye iletilecek cevabınızı yazın..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRequest(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="px-6 py-2 bg-[#0099CC] hover:bg-[#007da6] text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                                >
                                    {isSending ? 'Gönderiliyor...' : 'Cevabı Gönder'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
