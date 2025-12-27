'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { memberService } from '@/services/memberService';

// Reusing keys from NewMemberPage
const BOARD_ROLES = [
    { id: 'president', label: 'Yönetim Kurulu Başkanı' },
    { id: 'vice_president', label: 'Başkan Yardımcısı' },
    { id: 'executive_board', label: 'İcra Kurulu Üyesi' },
    { id: 'board_member', label: 'Yönetim Kurulu Üyesi' },
    { id: 'board_reserve', label: 'YK Yedek Üye' },
    { id: 'audit_board', label: 'Denetleme Kurulu Üyesi' },
    { id: 'audit_reserve', label: 'DK Yedek Üye' },
    { id: 'honorary_member', label: 'Fahri Üye' },
    { id: 'high_advisory_board', label: 'Yüksek İstişare Kurulu Üyesi' },
    { id: 'founder', label: 'Kurucu Üye' },
    { id: 'past_president', label: 'Geçmiş Dönem Başkanı' },
];

export default function EditMemberPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '', // Added phone
        membership_category: 'individual',
        member_type: 'active',
        membership_start_date: '',
        membership_end_date: '',
        board_roles: [] as string[],
        card_role: ''
    });

    useEffect(() => {
        loadMember();
    }, []);

    const loadMember = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/members/${id}`);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `HTTP ${res.status}`);
            }
            const member = await res.json();

            if (member) {
                setFormData({
                    full_name: member.full_name || '',
                    email: member.email || '',
                    phone: member.phone || '',
                    membership_category: member.membership_category || 'individual',
                    member_type: member.member_type || 'active',
                    membership_start_date: member.membership_date || '',
                    membership_end_date: member.membership_end_date || '',
                    board_roles: member.board_roles || [],
                    card_role: member.card_role || ''
                });
            }
        } catch (error: any) {
            console.error("Load Error:", error);
            alert(`Hata: ${error.message}`);
            // router.push('/admin/members'); // Keep user on page to see error
        }
        setIsLoading(false);
    };

    const handleRoleChange = (roleId: string, checked: boolean) => {
        setFormData(prev => {
            if (checked) {
                return { ...prev, board_roles: [...prev.board_roles, roleId] };
            } else {
                return { ...prev, board_roles: prev.board_roles.filter(id => id !== roleId) };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const res = await fetch(`/api/admin/members/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Güncelleme başarısız');
            }

            router.push('/admin/members');
            router.refresh(); // Refresh server state if needed
        } catch (error: any) {
            alert('Hata: ' + (error.message || error));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8">Yükleniyor...</div>;

    return (
        <div className="max-w-3xl mx-auto p-8">
            <div className="mb-8">
                <Link
                    href="/admin/members"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Üye Listesine Dön
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Üye Düzenle</h1>
                <p className="text-gray-500">Üyelik bilgilerini ve rollerini güncelleyin.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">

                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                        <input
                            type="text"
                            required
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                        <input
                            type="email"
                            required
                            disabled // Email usually shouldn't change easily as it matches Auth
                            value={formData.email}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+90 5XX XXX XX XX"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Membership Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Üyelik Kategorisi</label>
                        <select
                            value={formData.membership_category}
                            onChange={(e) => setFormData({ ...formData, membership_category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option value="individual">Bireysel</option>
                            <option value="corporate">Kurumsal</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Üyelik Durumu</label>
                        <select
                            value={formData.member_type}
                            onChange={(e) => setFormData({ ...formData, member_type: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option value="active">Aktif Üye</option>
                            <option value="honorary">Fahri Üye</option>
                            <option value="founder">Kurucu Üye</option>
                            <option value="left">Ayrılmış Üye</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Üyelik Başlangıç Tarihi</label>
                        <input
                            type="date"
                            value={formData.membership_start_date}
                            onChange={(e) => setFormData({ ...formData, membership_start_date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Üyelik Bitiş Tarihi</label>
                        <input
                            type="date"
                            value={formData.membership_end_date}
                            onChange={(e) => setFormData({ ...formData, membership_end_date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        />
                    </div>
                </div>

                {/* Board Roles */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Yönetim Görevleri</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Standard Roles */}
                        {[
                            { id: 'president', label: 'Yönetim Kurulu Başkanı' },
                            { id: 'vice_president', label: 'Başkan Yardımcısı' },
                            { id: 'executive_board', label: 'İcra Kurulu Üyesi' },
                            // Hierarchical roles handled below
                            { id: 'honorary_member', label: 'Fahri Üye' },
                            { id: 'high_advisory_board', label: 'Yüksek İstişare Kurulu Üyesi' },
                            { id: 'founder', label: 'Kurucu Üye' },
                            { id: 'past_president', label: 'Geçmiş Dönem Başkanı' },
                        ].map((role) => (
                            <label key={role.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.board_roles.includes(role.id)}
                                    onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{role.label}</span>
                            </label>
                        ))}

                        {/* Custom Components for Hierarchical Roles */}
                        <EditRoleGroup
                            label="Yönetim Kurulu Üyesi"
                            regularId="board_member"
                            reserveId="board_reserve"
                            currentRoles={formData.board_roles}
                            onChange={(newRoles) => setFormData({ ...formData, board_roles: newRoles })}
                        />

                        <EditRoleGroup
                            label="Denetleme Kurulu Üyesi"
                            regularId="audit_board"
                            reserveId="audit_reserve"
                            currentRoles={formData.board_roles}
                            onChange={(newRoles) => setFormData({ ...formData, board_roles: newRoles })}
                        />
                    </div>
                </div>

                {/* Üye Kartında Gözükecek Yönetim Görevi */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Üye Kartında Gözükecek Yönetim Görevi</label>
                    <p className="text-xs text-gray-500 mb-3">
                        Üyenin listeleme sayfalarındaki kartında (fotoğrafının altında) hangi görevinin yazacağını seçiniz.
                    </p>
                    <select
                        value={(formData as any).card_role || ''}
                        onChange={(e) => setFormData({ ...formData, card_role: e.target.value } as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
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

                <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#0099CC] text-white rounded-lg hover:bg-[#007da6] transition-colors disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </button>
                </div>

            </form>
        </div>
    );
}

function EditRoleGroup({
    label,
    regularId,
    reserveId,
    currentRoles,
    onChange
}: {
    label: string,
    regularId: string,
    reserveId: string,
    currentRoles: string[],
    onChange: (roles: string[]) => void
}) {
    const isRegular = currentRoles.includes(regularId);
    const isReserve = currentRoles.includes(reserveId);
    const isActive = isRegular || isReserve;
    const subRole = isReserve ? 'reserve' : 'regular';

    const handleCheck = (checked: boolean) => {
        let newRoles = [...currentRoles];
        // Remove both first
        newRoles = newRoles.filter(r => r !== regularId && r !== reserveId);

        if (checked) {
            // Add default (regular)
            newRoles.push(regularId);
        }
        onChange(newRoles);
    };

    const handleSubChange = (newSub: 'regular' | 'reserve') => {
        let newRoles = [...currentRoles];
        // Remove both
        newRoles = newRoles.filter(r => r !== regularId && r !== reserveId);

        // Add selected
        newRoles.push(newSub === 'regular' ? regularId : reserveId);
        onChange(newRoles);
    };

    return (
        <div className={`p-3 border border-gray-200 rounded-lg transition-colors ${isActive ? 'bg-blue-50/50 border-blue-200' : 'hover:bg-gray-50'}`}>
            <label className="flex items-center space-x-3 cursor-pointer mb-2">
                <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => handleCheck(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 font-medium">{label}</span>
            </label>

            {isActive && (
                <div className="ml-7">
                    <select
                        value={subRole}
                        onChange={(e) => handleSubChange(e.target.value as 'regular' | 'reserve')}
                        className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0099CC] bg-white"
                    >
                        <option value="regular">Asil Üye</option>
                        <option value="reserve">Yedek Üye</option>
                    </select>
                </div>
            )}
        </div>
    );
}
