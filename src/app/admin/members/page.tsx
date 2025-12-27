'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Search, RefreshCw, Eye } from 'lucide-react';
import { memberService, DbMember } from '@/services/memberService';
import { useRouter } from 'next/navigation';

export default function AdminMembersPage() {
    const [members, setMembers] = useState<DbMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const router = useRouter();

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        setIsLoading(true);
        const data = await memberService.getAllMembers();
        // Filter out admin users (those with GYİAD as company or admin emails)
        const memberData = (data || []).filter(m =>
            m.company_name !== 'GYİAD' &&
            !m.email?.includes('upgunagent') &&
            !m.email?.includes('admin@gyiad')
        );
        setMembers(memberData);
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu üyeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

        try {
            const res = await fetch(`/api/admin/members/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Silme işlemi başarısız');
            loadMembers(); // Refresh list
        } catch (error) {
            alert('Hata oluştu: ' + error);
        }
    };

    const handleRequestUpdate = async (id: string, email: string) => {
        if (!confirm(`"${email}" adresine profil güncelleme hatırlatması gönderilsin mi?`)) return;

        try {
            const res = await fetch('/api/admin/members/request-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId: id })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Mail gönderilemedi');
            }

            alert('Güncelleme talebi başarıyla gönderildi.');
        } catch (error: any) {
            alert('Hata: ' + error.message);
        }
    };

    // function removed

    const filteredMembers = members.filter(m => {
        // Search filter
        const matchesSearch = m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.company_name?.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const matchesStatus = statusFilter === 'all' || m.member_type === statusFilter;

        // Role filter
        const matchesRole = roleFilter === 'all' ||
            (m.board_roles && m.board_roles.includes(roleFilter));

        return matchesSearch && matchesStatus && matchesRole;
    });

    return (
        <div className="p-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Üye Yönetimi</h1>
                    <p className="text-gray-500">Tüm üyeleri görüntüleyin, düzenleyin veya silin.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin/members/new"
                        className="flex items-center gap-2 px-4 py-2 bg-[#0099CC] text-white rounded-lg hover:bg-[#007aa3] transition-colors text-sm font-medium shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Üye
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Search and Filters */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="İsim veya şirket ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-transparent outline-none"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-transparent outline-none bg-white"
                        >
                            <option value="all">Tüm Durumlar</option>
                            <option value="active">Aktif Üye</option>
                            <option value="honorary">Fahri Üye</option>
                            <option value="founder">Kurucu Üye</option>
                            <option value="left">Ayrılmış Üye</option>
                        </select>

                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-transparent outline-none bg-white"
                        >
                            <option value="all">Tüm Roller</option>
                            <option value="president">Başkan</option>
                            <option value="vice_president">Başkan Yardımcısı</option>
                            <option value="executive_board">İcra Kurulu</option>
                            <option value="board_member">Yönetim Kurulu</option>
                            <option value="board_reserve">YK Yedek</option>
                            <option value="audit_board">Denetleme Kurulu</option>
                            <option value="audit_reserve">DK Yedek</option>
                            <option value="honorary_member">Fahri Üye</option>
                            <option value="high_advisory_board">Yüksek İstişare Kurulu</option>
                            <option value="founder">Kurucu</option>
                            <option value="past_president">Geçmiş Dönem Başkan</option>
                        </select>
                    </div>
                </div>

                {/* Content - Responsive Table/Cards */}
                <div className="overflow-x-auto">
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4 p-4 bg-gray-50">
                        {isLoading ? (
                            <div className="text-center text-gray-500 py-8">Yükleniyor...</div>
                        ) : filteredMembers.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">Kayıt bulunamadı.</div>
                        ) : (
                            filteredMembers.map((member) => (
                                <div key={member.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">

                                    {/* Header: Avatar, Name, Email, Actions */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            {member.avatar_url ? (
                                                <img src={member.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-lg">
                                                    {member.full_name?.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-gray-900">{member.full_name}</div>
                                                <div className="text-sm text-gray-500 break-all">{member.email}</div>
                                            </div>
                                        </div>

                                        {/* Actions Menu (Compact) */}
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => window.open(`/members/${member.id}`, '_blank')}
                                                className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                                                title="Önizle"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleRequestUpdate(member.id, member.email)}
                                                className="p-2 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-orange-50"
                                                title="Hatırlatma Gönder"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => router.push(`/admin/members/${member.id}/edit`)}
                                                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                                                title="Düzenle"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                                title="Sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <hr className="border-gray-100" />

                                    {/* Company & Status */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Şirket / Pozisyon</div>
                                            <div className="text-sm font-medium text-gray-900">{member.company_name}</div>
                                            <div className="text-xs text-gray-500">{member.position}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Durum</div>
                                            <Badge type={member.member_type}>{formatMemberType(member.member_type)}</Badge>
                                        </div>
                                    </div>

                                    {/* Roles */}
                                    {member.board_roles && member.board_roles.length > 0 && (
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Roller</div>
                                            <div className="flex flex-wrap gap-1">
                                                {member.board_roles.map(r => (
                                                    <span key={r} className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded border border-gray-200 shadow-sm">
                                                        {formatRole(r)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <table className="hidden md:table w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">Üye Bilgisi</th>
                                <th className="px-6 py-4">Şirket / Pozisyon</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4">Roller</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Yükleniyor...</td>
                                </tr>
                            ) : filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Kayıt bulunamadı.</td>
                                </tr>
                            ) : (
                                filteredMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {member.avatar_url ? (
                                                    <img src={member.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium">
                                                        {member.full_name?.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold text-gray-900">{member.full_name}</div>
                                                    <div className="text-sm text-gray-500">{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900">{member.company_name}</div>
                                            <div className="text-sm text-gray-500">{member.position}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge type={member.member_type}>{formatMemberType(member.member_type)}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {member.board_roles?.map(r => (
                                                    <span key={r} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                                                        {formatRole(r)}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => router.push(`/admin/members/${member.id}`)}
                                                className="inline-flex p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Önizle"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleRequestUpdate(member.id, member.email)}
                                                className="inline-flex p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors group relative"
                                                title="Üye'ye Profil Düzenleme Bildimi Gönder"
                                            >
                                                <RefreshCw className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => router.push(`/admin/members/${member.id}/edit`)}
                                                className="inline-flex p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Düzenle"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                className="inline-flex p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Badge({ children, type }: { children: React.ReactNode, type: string }) {
    const colors: Record<string, string> = {
        'active': 'bg-green-100 text-green-700',
        'honorary': 'bg-purple-100 text-purple-700',
        'founder': 'bg-orange-100 text-orange-700',
        'left': 'bg-red-100 text-red-700',
    };
    return (
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-700'}`}>
            {children}
        </span>
    );
}

function formatMemberType(type: string) {
    const map: Record<string, string> = {
        'active': 'Aktif Üye',
        'honorary': 'Fahri Üye',
        'founder': 'Kurucu Üye',
        'left': 'Ayrılmış Üye'
    };
    return map[type] || type;
}

function formatRole(role: string) {
    const roleMap: Record<string, string> = {
        'president': 'Başkan',
        'vice_president': 'Başkan Yrd.',
        'executive_board': 'İcra K.',
        'board_member': 'Yönetim K.',
        'board_reserve': 'YK Yedek',
        'audit_board': 'Denetleme K.',
        'audit_reserve': 'DK Yedek',
        'high_advisory_board': 'YİK',
        'founder': 'Kurucu',
        'past_president': 'Geçmiş Bşk.'
    };
    return roleMap[role] || role;
}
