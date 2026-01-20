'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Search, RefreshCw, Eye, Download } from 'lucide-react';
import { memberService, DbMember } from '@/services/memberService';
import { useRouter } from 'next/navigation';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function AdminMembersPage() {
    const [members, setMembers] = useState<DbMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [genderFilter, setGenderFilter] = useState<string>('all');
    const [yearFilter, setYearFilter] = useState<string>('all');
    const router = useRouter();

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 21 }, (_, i) => currentYear - i);

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        setIsLoading(true);
        const data = await memberService.getAllMembers();
        const memberData = (data || []).filter(m => !m.is_admin);
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

    const handleExportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Gyiad Üye Listesi');

        // 1. Title (Row 1) - Moved to A1 as requested
        const titleRow = worksheet.getRow(1);
        const titleCell = titleRow.getCell(1); // A1
        titleCell.value = `GYİAD ÜYE LİSTESİ (Üye Sayısı: ${filteredMembers.length} Kişi)`;
        titleCell.font = { name: 'Arial', size: 16, bold: true }; // 16pt
        titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
        worksheet.mergeCells('A1:D1');
        titleRow.height = 30;

        // 2. Define Columns (Row 2)
        const headerRow = worksheet.getRow(2);
        const columns = [
            'S.No', 'Ad Soyad', 'Email', 'Telefon', 'Doğum Tarihi', 'Medeni Durum', 'Cinsiyet', 'Eğitim', 'Yabancı Diller',
            'Diğer Üyelikler', 'Şirket Adı', 'Adres', 'Pozisyon', 'Sektör', 'Web Siteleri', 'LinkedIn',
            'Üyelik Türü', 'Durumu', 'Başlangıç Tarihi', 'Bitiş Tarihi'
        ];
        headerRow.values = columns;

        headerRow.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0099CC' }
        };
        headerRow.height = 30;

        // 3. Add Data
        filteredMembers.forEach((m, index) => {
            const rowValues = [
                index + 1, // S.No
                m.full_name,
                m.email,
                m.phone,
                m.birth_date,
                m.marital_status === 'single' ? 'Bekar' : 'Evli',
                m.gender === 'male' ? 'Erkek' : m.gender === 'female' ? 'Kadın' : '',
                m.education?.map((e: any) => e.school).join(', '),
                m.languages?.join(', '),
                m.other_memberships,
                m.company_name,
                m.company_address,
                m.position,
                m.sector,
                m.websites?.join(', '),
                m.linkedin_url,
                formatMemberType(m.member_type),
                m.member_type === 'left' ? 'Ayrıldı' : 'Aktif',
                m.membership_date,
                m.membership_end_date
            ];
            const row = worksheet.addRow(rowValues);

            // Styling for this row
            // A Column (S.No) Center
            row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };

            // Type (17) & Status (18) Coloring & Centering
            const typeCell = row.getCell(17);
            const statusCell = row.getCell(18);

            [typeCell, statusCell].forEach(cell => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                const val = cell.value?.toString() || '';

                let argb = null;
                if (val.includes('Aktif')) argb = 'FFC6EFCE'; // Green
                else if (val.includes('Fahri')) argb = 'FFE9D5FF'; // Purple
                else if (val.includes('Ayrıl') || val.includes('Ayrılmış')) argb = 'FFFFC7CE'; // Red

                if (argb) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb }
                    };
                }
            });
        });

        // 4. Global Column Formatting & Borders
        worksheet.columns.forEach((column, i) => {
            column.width = 25;
            if (i !== 0 && i !== 16 && i !== 17) {
                column.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
            }
        });

        // Specific widths
        worksheet.getColumn(1).width = 8;  // S.No
        worksheet.getColumn(2).width = 30; // Name
        worksheet.getColumn(3).width = 30; // Email
        worksheet.getColumn(10).width = 30; // Other memberships
        worksheet.getColumn(12).width = 40; // Address

        // Apply Borders to all cells in the table (Starting form Row 2)
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber >= 2) {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            }
        });

        // Save
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Gyiad_Uye_Listesi_${new Date().toLocaleDateString('tr-TR')}.xlsx`);
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

        // Gender filter
        const matchesGender = genderFilter === 'all' || m.gender === genderFilter;

        // Year filter
        const matchesYear = yearFilter === 'all' || (m.membership_date && new Date(m.membership_date).getFullYear().toString() === yearFilter);

        return matchesSearch && matchesStatus && matchesRole && matchesGender && matchesYear;
    });

    return (
        <div className="p-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Üye Yönetimi</h1>
                    <p className="text-gray-500">Tüm üyeleri görüntüleyin, düzenleyin veya silin.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Excel İndir
                    </button>
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
                    <div className="flex flex-col md:flex-row gap-4 flex-wrap">
                        <div className="relative flex-1 max-w-md min-w-[200px]">
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
                            <option value="all">Tüm Üyelikler</option>
                            <option value="active">Aktif Üye</option>
                            <option value="honorary">Fahri Üye</option>
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

                            <option value="high_advisory_board">Yüksek İstişare Kurulu</option>
                            <option value="founder">Kurucu</option>
                            <option value="past_president">Geçmiş Dönem Başkan</option>
                        </select>

                        <select
                            value={genderFilter}
                            onChange={(e) => setGenderFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-transparent outline-none bg-white"
                        >
                            <option value="all">Cinsiyet</option>
                            <option value="male">Erkek</option>
                            <option value="female">Kadın</option>
                        </select>

                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-transparent outline-none bg-white"
                        >
                            <option value="all">Tüm Yıllar</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
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
                                <th className="px-6 py-4 text-center">KVKK</th>
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
                                        <td className="px-6 py-4 text-center">
                                            {member.kvkk_consent ? (
                                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </div>
                                            )}
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
        </div >
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
