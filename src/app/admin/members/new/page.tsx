'use client';

import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { sectors } from '@/data/sectors'; // Reusing sectors list

export default function NewMemberPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget; // Capture reference before async
        setIsLoading(true);
        setMessage(null);

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        // Explicitly handle multi-select checkboxes for board_roles
        const boardRoles = formData.getAll('board_roles');
        (data as any).board_roles = boardRoles;

        try {
            const res = await fetch('/api/admin/create-member', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.error || 'Bir hata oluştu');

            setMessage({ text: 'Üye kaydı tamamlanmıştır. Üye\'ye bilgiler mail yoluyla iletilmiştir.', type: 'success' });
            form.reset(); // Use captured reference
        } catch (err: any) {
            setMessage({ text: err.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Yeni Üye Kaydı</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {message && (
                    <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Kişisel Bilgiler */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Ad Soyad</label>
                            <input name="full_name" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">E-Posta</label>
                            <input name="email" type="email" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon Numarası</label>
                            <input name="phone" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50" placeholder="+90 5XX XXX XX XX" />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-6"></div>

                    {/* Üyelik Detayları */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Üyelik Türü (Kategori)</label>
                            <select name="membership_category" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50">
                                <option value="individual">Bireysel Üye</option>
                                <option value="corporate">Kurumsal Üye</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Üyelik Durumu</label>
                            <select name="membership_status" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50">
                                <option value="active">Aktif Üye</option>
                                <option value="honorary">Fahri Üye</option>
                                <option value="left">Ayrılmış Üye</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Üyelik Başlangıç Tarihi</label>
                            <input name="membership_start_date" type="date" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Üyelik Bitiş Tarihi (Opsiyonel)</label>
                            <input name="membership_end_date" type="date" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50" />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-6"></div>

                    {/* Yönetim Görevi (Çoklu Seçim) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Yönetim Görevi (Birden fazla seçilebilir)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {/* Custom Logic for Roles */}
                            {/* Standard Roles */}
                            {[
                                { id: 'president', label: 'Yönetim Kurulu Başkanı' },
                                { id: 'vice_president', label: 'Başkan Yardımcısı' },
                                { id: 'executive_board', label: 'İcra Kurulu Üyesi' },
                                // board_member & board_reserve handled separately below
                                // audit_board & audit_reserve handled separately below
                                { id: 'high_advisory_board', label: 'Yüksek İstişare Kurulu Üyesi' },
                                { id: 'founder', label: 'Kurucu Üye' },
                                { id: 'past_president', label: 'Geçmiş Dönem YK Başkanı' }
                            ].map((role) => (
                                <label key={role.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
                                    <input
                                        type="checkbox"
                                        name="board_roles"
                                        value={role.id}
                                        className="w-4 h-4 text-[#0099CC] rounded border-gray-300 focus:ring-[#0099CC]"
                                    />
                                    <span className="text-sm text-gray-700">{role.label}</span>
                                </label>
                            ))}

                            {/* Hierarchical Board Member Selection */}
                            <BoardRoleGroup
                                label="Yönetim Kurulu Üyesi"
                                name="board_roles"
                                regularId="board_member"
                                reserveId="board_reserve"
                            />

                            {/* Hierarchical Audit Member Selection */}
                            <BoardRoleGroup
                                label="Denetleme Kurulu Üyesi"
                                name="board_roles"
                                regularId="audit_board"
                                reserveId="audit_reserve"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-6"></div>

                    {/* Üye Kartında Gözükecek Yönetim Görevi */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Üye Kartında Gözükecek Yönetim Görevi</label>
                        <p className="text-xs text-gray-500 mb-3">
                            Üyenin listeleme sayfalarındaki kartında (fotoğrafının altında) hangi görevinin yazacağını seçiniz.
                        </p>
                        <select name="card_role" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50">
                            <option value="">(Seçiniz - Boş Bırakılabilir)</option>
                            <option value="Yönetim Kurulu Başkanı">Yönetim Kurulu Başkanı</option>
                            <option value="Başkan Yardımcısı">Başkan Yardımcısı</option>
                            <option value="İcra Kurulu Üyesi">İcra Kurulu Üyesi</option>
                            <option value="Yönetim Kurulu Üyesi (Asil Üye)">Yönetim Kurulu Üyesi (Asil Üye)</option>
                            <option value="Yönetim Kurulu Üyesi (Yedek Üye)">Yönetim Kurulu Üyesi (Yedek Üye)</option>
                            <option value="Yüksek İstişare Kurulu Üyesi">Yüksek İstişare Kurulu Üyesi</option>
                            <option value="Kurucu Üye">Kurucu Üye</option>
                            <option value="Geçmiş Dönem YK Başkanı">Geçmiş Dönem YK Başkanı</option>
                            <option value="Denetim Kurulu Üyesi (Asil Üye)">Denetim Kurulu Üyesi (Asil Üye)</option>
                            <option value="Denetim Kurulu Üyesi (Yedek Üye)">Denetim Kurulu Üyesi (Yedek Üye)</option>
                        </select>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[#0099CC] hover:bg-[#007da6] text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg shadow-[#0099CC]/20"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Üye Kaydı Aç
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Helper Component for Hierarchical Roles
function BoardRoleGroup({ label, name, regularId, reserveId }: { label: string, name: string, regularId: string, reserveId: string }) {
    const [isActive, setIsActive] = useState(false);
    const [subRole, setSubRole] = useState<'regular' | 'reserve'>('regular');

    return (
        <div className={`p-2 rounded transition-colors ${isActive ? 'bg-blue-50/50 border border-blue-100' : 'hover:bg-gray-100'}`}>
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#0099CC] rounded border-gray-300 focus:ring-[#0099CC]"
                />
                <span className="text-sm text-gray-700 font-medium">{label}</span>
            </label>

            {isActive && (
                <div className="mt-2 pl-6">
                    <select
                        // We use a hidden input logic for the actual value because this select orchestrates it
                        value={subRole}
                        onChange={(e) => setSubRole(e.target.value as 'regular' | 'reserve')}
                        className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0099CC]"
                    >
                        <option value="regular">Asil Üye</option>
                        <option value="reserve">Yedek Üye</option>
                    </select>
                    {/* The actual input that sends data */}
                    <input type="hidden" name={name} value={subRole === 'regular' ? regularId : reserveId} />
                </div>
            )}
        </div>
    );
}
