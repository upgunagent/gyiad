'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
    Building2,
    Globe,
    Mail,
    Linkedin,
    Award,
    Briefcase,
    User,
    ArrowLeft
} from 'lucide-react';

type MemberProfileViewProps = {
    member: any;
    backLink: string;
    backText: string;
    sidebar?: React.ReactNode;
    actionButton?: React.ReactNode;
};

export default function MemberProfileView({ member, backLink, backText, sidebar, embedded = false, actionButton }: MemberProfileViewProps & { embedded?: boolean }) {

    const Content = () => (
        <div className="max-w-7xl mx-auto pb-12">
            {/* Header / Back Button */}
            <div className="p-6">
                <Link
                    href={backLink}
                    className="inline-flex items-center text-gray-500 hover:text-[#0099CC] transition-colors gap-2 text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {backText}
                </Link>
            </div>

            {/* Hero Section */}
            <div className="bg-white mx-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                {/* Banner Background */}
                <div className="h-48 bg-gradient-to-r from-[#0099CC] to-[#006699] opacity-10"></div>

                <div className="px-8 pb-8 flex flex-col md:flex-row gap-8 relative mt-[-64px]">
                    {/* Profile Image */}
                    <div className="flex-shrink-0">
                        <div className="w-72 h-72 rounded-full border-4 border-white shadow-lg relative bg-white flex items-center justify-center overflow-hidden">
                            {member.avatar_url ? (
                                <Image
                                    src={member.avatar_url}
                                    alt={member.full_name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <User className="w-20 h-20 text-gray-300" />
                            )}
                        </div>
                    </div>

                    {/* Main Info & Actions */}
                    <div className="flex-1 pt-16 md:pt-20 lg:pt-20 flex flex-col justify-end">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{member.full_name}</h1>
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                    <Building2 className="w-4 h-4 text-[#0099CC]" />
                                    <span className="font-medium text-lg">{member.company_name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Briefcase className="w-4 h-4" />
                                    <span>{member.position}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {actionButton}
                                {member.linkedin_url ? (
                                    <a
                                        href={member.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-[#0077b5] hover:bg-[#006097] text-white rounded-lg transition-colors font-medium text-sm"
                                    >
                                        <Linkedin className="w-4 h-4" />
                                        LinkedIn Profili
                                    </a>
                                ) : (
                                    <button disabled className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg font-medium text-sm cursor-not-allowed">
                                        <Linkedin className="w-4 h-4" />
                                        LinkedIn
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 mt-6">

                {/* Column 1: Corporate Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-3 border-b border-gray-100">
                        <Building2 className="w-5 h-5 text-[#E53935]" />
                        Kurumsal Bilgiler
                    </h2>
                    <div className="space-y-6">
                        <div className="group">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Şirket</label>
                            <div className="font-medium text-gray-900">{member.company_name}</div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Pozisyon</label>
                            <div className="font-medium text-gray-900">{member.position}</div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Şirket Adresi</label>
                            <div className="font-medium text-gray-900 whitespace-pre-wrap">{member.company_address || '-'}</div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Sektör</label>
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                {member.sector}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">İş Alanı</label>
                            <div className="font-medium text-gray-900">{member.business_area || '-'}</div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">İletişim</label>
                            <div className="flex flex-col gap-2">
                                {member.websites?.filter((site: string) => site && site.trim() !== '').map((site: string, i: number) => (
                                    <a key={i} href={`https://${site}`} target="_blank" className="flex items-center gap-2 text-[#0099CC] hover:underline text-sm font-medium">
                                        <Globe className="w-3 h-3" />
                                        {site}
                                    </a>
                                ))}
                                {member.phone && (
                                    <div className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                                        {/* Phone conditionally hidden */}
                                    </div>
                                )}
                            </div>
                        </div>
                        {member.company_turnover && (
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Şirket Yıllık Cirosu</label>
                                <div className="font-medium text-gray-900">{member.company_turnover}</div>
                            </div>
                        )}
                        {member.number_of_employees && (
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Çalışan Sayısı</label>
                                <div className="font-medium text-gray-900">{member.number_of_employees}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 2: Personal Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-3 border-b border-gray-100">
                        <User className="w-5 h-5 text-[#E53935]" />
                        Kişisel Bilgiler
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Eğitim</label>
                            <div className="space-y-3">
                                {member.education?.map((edu: any, i: number) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0"></div>
                                        <div>
                                            <div className="font-medium text-gray-900 text-sm">
                                                {edu.school} <span className="text-gray-500 font-normal ml-1">({edu.level})</span>
                                            </div>
                                            <div className="text-xs text-gray-500">{edu.department} <span className="text-gray-300 mx-1">•</span> {edu.year}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Yabancı Diller</label>
                            <div className="flex flex-wrap gap-2">
                                {member.languages?.map((lang: string, i: number) => (
                                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Doğum Tarihi</label>
                                <div className="font-medium text-gray-900 text-sm">
                                    {member.birth_date ? (
                                        <>
                                            {new Date(member.birth_date).toLocaleDateString('tr-TR')}
                                            {(() => {
                                                const birthDate = new Date(member.birth_date);
                                                const today = new Date();
                                                let age = today.getFullYear() - birthDate.getFullYear();
                                                const m = today.getMonth() - birthDate.getMonth();
                                                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                                    age--;
                                                }
                                                return <span className="text-gray-500 ml-1">({age} Yaş)</span>;
                                            })()}
                                        </>
                                    ) : '-'}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Medeni Durum</label>
                                <div className="font-medium text-gray-900 text-sm capitalize">{member.marital_status === 'married' ? 'Evli' : 'Bekar'}</div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Cinsiyet</label>
                                <div className="font-medium text-gray-900 text-sm capitalize">
                                    {member.gender === 'male' ? 'Erkek' : member.gender === 'female' ? 'Kadın' : '-'}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Diğer Üyelikler</label>
                            <div className="font-medium text-gray-900 text-sm">{member.other_memberships || '-'}</div>
                        </div>
                    </div>
                </div>

                {/* Column 3: GYIAD Info (Full Width) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-3 border-b border-gray-100">
                        <Award className="w-5 h-5 text-[#E53935]" />
                        GYİAD BİLGİLERİ
                    </h2>

                    {/* Row 1: Read-only visual fields (5 Columns) */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8 p-5 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Üyelik Türü</label>
                            <div className="font-semibold text-gray-700 text-sm">
                                {member.membership_category === 'corporate' ? 'Kurumsal Üye' : 'Bireysel Üye'}
                            </div>
                        </div>
                        <div className="lg:border-l lg:border-gray-200 lg:pl-6">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Üyelik Durumu</label>
                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${member.member_type === 'active' ? 'bg-green-100 text-green-700' :
                                member.member_type === 'honorary' ? 'bg-purple-100 text-purple-700' :
                                    member.member_type === 'founder' ? 'bg-orange-100 text-orange-700' :
                                        'bg-gray-100 text-gray-700'
                                }`}>
                                {member.member_type === 'active' ? 'Aktif Üye' :
                                    member.member_type === 'honorary' ? 'Fahri Üye' :
                                        member.member_type === 'founder' ? 'Kurucu Üye' :
                                            member.member_type === 'left' ? 'Ayrılmış Üye' :
                                                member.member_type}
                            </div>
                        </div>
                        <div className="lg:border-l lg:border-gray-200 lg:pl-6">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Üyelik Tarihi</label>
                            <div className="font-semibold text-gray-700 text-sm">
                                {member.membership_date ? new Date(member.membership_date).toLocaleDateString('tr-TR') : '-'}
                            </div>
                        </div>
                        <div className="lg:border-l lg:border-gray-200 lg:pl-6">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Üyelik Bitiş Tarihi</label>
                            <div className="font-semibold text-gray-700 text-sm">
                                {member.membership_end_date ? new Date(member.membership_end_date).toLocaleDateString('tr-TR') : '-'}
                            </div>
                        </div>
                        <div className="lg:border-l lg:border-gray-200 lg:pl-6">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Yönetim Görevi</label>
                            <div className="font-semibold text-gray-700 text-sm space-y-1">
                                {(!member.board_roles || member.board_roles.length === 0) ? (
                                    <span>-</span>
                                ) : (
                                    member.board_roles.map((role: string) => {
                                        const label = {
                                            'president': 'Yönetim Kurulu Başkanı',
                                            'vice_president': 'Başkan Yardımcısı',
                                            'executive_board': 'İcra Kurulu Üyesi',
                                            'board_member': 'Yönetim Kurulu Üyesi (Asil Üye)',
                                            'board_reserve': 'Yönetim Kurulu Üyesi (Yedek Üye)',
                                            'audit_board': 'Denetleme Kurulu Üyesi (Asil Üye)',
                                            'audit_reserve': 'Denetleme Kurulu Üyesi (Yedek Üye)',
                                            'honorary_member': 'Fahri Üye',
                                            'high_advisory_board': 'Yüksek İstişare Kurulu Üyesi',
                                            'founder': 'Kurucu Üye',
                                            'past_president': 'Geçmiş Dönem Başkanı'
                                        }[role] || role;
                                        return <div key={role}>{label}</div>;
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Projects (Full Width) */}
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Diğer GYİAD Çalışmaları</label>
                        <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed border border-gray-100 min-h-[100px] whitespace-pre-wrap">
                            {member.gyiad_projects || 'Henüz aktif bir çalışma bulunmuyor.'}
                        </div>
                    </div>
                </div>

            </div >
        </div >
    );

    if (embedded) {
        return <Content />;
    }

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            {sidebar}

            {/* Main Content */}
            <main className="flex-1 ml-0 md:ml-72 overflow-y-auto transition-all duration-300">
                <div className="max-w-7xl mx-auto pb-12">
                    <Content />
                </div>
            </main>
        </div>
    );
}
