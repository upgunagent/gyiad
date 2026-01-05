'use client';

import Sidebar from '@/components/Sidebar';
import { mockMembers } from '@/data/mock-members';
import { sectors } from '@/data/sectors';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
    Building2,
    Globe,
    Mail,
    Linkedin,
    Award,
    Briefcase,
    User,
    Save,
    X,
    Camera,
    Trash2,
    ShieldCheck
} from 'lucide-react';

import { memberService } from '@/services/memberService';
import { createClient } from '@/lib/supabase/client';
// ... imports

export default function ProfileEditPage() {
    const [member, setMember] = useState<any>(null); // Start null to show loading/fetching
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [kvkkText, setKvkkText] = useState('');
    const [showKvkkModal, setShowKvkkModal] = useState(false);
    const projectsRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea on load and value change
    useEffect(() => {
        if (projectsRef.current) {
            projectsRef.current.style.height = 'auto';
            projectsRef.current.style.height = projectsRef.current.scrollHeight + 'px';
        }
    }, [member?.gyiad_projects]);

    useEffect(() => {
        async function loadProfile() {
            const user = await memberService.getCurrentUser();
            if (user) {
                setUserId(user.id);
                const profile = await memberService.getProfile(user.id);
                if (profile) {
                    // Filter empty websites and ensure at least 1 field
                    const filteredWebsites = profile.websites?.filter((w: string) => w && w.trim() !== '') || [];
                    const websites = filteredWebsites.length > 0 ? filteredWebsites : [''];
                    setMember({ ...profile, websites });
                } else {
                    // Fallback
                    const fallback = mockMembers[0];
                    const websites = fallback.websites || [];
                    while (websites.length < 3) websites.push('');
                    setMember({ ...fallback, websites });
                }
            } else {
                setMember(mockMembers[0]);
            }
            setIsLoading(false);
        }
        loadProfile();
        loadKvkkText();
    }, []);

    const loadKvkkText = async () => {
        const text = await memberService.getKvkkText();
        setKvkkText(text || 'KVKK Metni yüklenemedi.');
    };

    const handleSave = async () => {
        if (!userId || !member) {
            alert("Lütfen önce Demo DB Hazırla butonuna basarak giriş yapınız.");
            return;
        }
        if (!member.kvkk_consent) {
            alert("Lütfen değişiklikleri kaydetmek için KVKK metnini onaylayınız.");
            setShowKvkkModal(true);
            return;
        }
        setIsLoading(true);
        try {
            await memberService.updateProfile(userId, {
                education: member.education,
                full_name: member.full_name,
                company_name: member.company_name,
                company_address: member.company_address,
                position: member.position,
                sector: member.sector,
                business_area: member.business_area,
                company_turnover: member.company_turnover,
                number_of_employees: member.number_of_employees,
                websites: member.websites ? member.websites.filter((w: string) => w.trim() !== '') : [],
                email: member.email,
                birth_date: member.birth_date,
                marital_status: member.marital_status || 'single',
                gender: member.gender,
                languages: member.languages,
                other_memberships: member.other_memberships,
                gyiad_projects: member.gyiad_projects,
                linkedin_url: member.linkedin_url,

                avatar_url: member.avatar_url,
                kvkk_consent: member.kvkk_consent,
                kvkk_consent_date: new Date().toISOString()
            });
            // Success
            window.location.href = `/members/${userId}`; // Go to detail page to see changes
        } catch (err: any) {
            console.error('Save error details:', err);
            alert(`Kaydetme hatası: ${err.message || JSON.stringify(err) || 'Bilinmeyen hata'}`);
        }
        setIsLoading(false);
    };

    if (!member) return <div className="flex h-screen items-center justify-center">Yükleniyor...</div>;

    return (
        <div className="flex h-screen bg-gray-50 font-sans">

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 ml-0 md:ml-72 overflow-y-auto transition-all duration-300">
                <div className="max-w-7xl mx-auto pb-12">

                    {/* Header Spacer */}
                    <div className="h-6"></div>

                    {/* Hero Section (Editable Photo) */}
                    <div className="bg-white mx-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                        {/* Banner Background */}
                        <div className="h-48 bg-gradient-to-r from-[#0099CC] to-[#006699] opacity-10"></div>

                        <div className="px-8 pb-8 flex flex-col md:flex-row gap-8 relative mt-[-64px]">
                            {/* Profile Image Edit */}
                            <div className="flex-shrink-0 relative group">
                                <div
                                    className="w-48 h-48 rounded-full border-4 border-white shadow-lg relative bg-white overflow-hidden cursor-pointer"
                                    onClick={() => document.getElementById('avatar-upload')?.click()}
                                >
                                    {member.avatar_url ? (
                                        <Image
                                            src={member.avatar_url}
                                            alt={member.full_name}
                                            fill
                                            className="object-cover group-hover:opacity-75 transition-opacity"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors">
                                            <User className="w-20 h-20 text-gray-300" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <Camera className="w-8 h-8 text-gray-800" />
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-4 flex gap-2">
                                    {member.avatar_url && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Profil fotoğrafını kaldırmak istediğinize emin misiniz?')) {
                                                    setMember({ ...member, avatar_url: '' });
                                                }
                                            }}
                                            className="bg-white p-2 rounded-full shadow-md border border-gray-200 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                            title="Fotoğrafı Kaldır"
                                            type="button"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => document.getElementById('avatar-upload')?.click()}
                                        className="bg-white p-2 rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-[#0099CC] transition-colors"
                                        title="Fotoğrafı Değiştir"
                                        type="button"
                                    >
                                        <Camera className="w-5 h-5" />
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        if (e.target.files && e.target.files[0] && userId) {
                                            setIsLoading(true);
                                            try {
                                                const publicUrl = await memberService.uploadAvatar(e.target.files[0], userId);
                                                setMember({ ...member, avatar_url: publicUrl });
                                            } catch (error) {
                                                console.error('Avatar upload failed:', error);
                                                alert('Fotoğraf yüklenirken bir hata oluştu.');
                                            }
                                            setIsLoading(false);
                                        }
                                    }}
                                />
                            </div>

                            {/* Main Info & Actions */}
                            <div className="flex-1 pt-16 md:pt-20 lg:pt-20 flex flex-col justify-end">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                    <div className="w-full max-w-lg">
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Ad Soyad</label>
                                        <input
                                            type="text"
                                            value={member.full_name}
                                            onChange={(e) => setMember({ ...member, full_name: e.target.value })}
                                            className="text-3xl font-bold text-gray-900 mb-2 w-full border-b border-gray-200 focus:border-[#0099CC] focus:outline-none bg-transparent px-1 py-1"
                                        />


                                    </div>

                                    <div className="flex gap-3">
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium text-sm shadow-sm"
                                        >
                                            <X className="w-4 h-4" />
                                            İptal
                                        </Link>
                                        <button
                                            onClick={handleSave}
                                            disabled={isLoading}
                                            className="flex items-center gap-2 px-6 py-2 bg-[#0099CC] hover:bg-[#007aa3] text-white rounded-lg transition-colors font-medium text-sm shadow-sm disabled:opacity-50"
                                        >
                                            {isLoading ? (
                                                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full block"></span>
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                            {isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                        </button>
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

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">ŞİRKET</label>
                                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                            <Building2 className="w-4 h-4 text-[#0099CC]" />
                                            <input
                                                type="text"
                                                value={member.company_name || ''}
                                                onChange={(e) => setMember({ ...member, company_name: e.target.value })}
                                                className="font-medium bg-transparent focus:outline-none w-full"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">ŞİRKET ADRESİ</label>
                                        <textarea
                                            value={member.company_address || ''}
                                            onChange={(e) => setMember({ ...member, company_address: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] min-h-[80px] text-sm bg-gray-50"
                                            placeholder="Tam şirket adresi..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">POZSİYON</label>
                                        <div className="flex items-center gap-2 text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                            <Briefcase className="w-4 h-4" />
                                            <input
                                                type="text"
                                                value={member.position}
                                                onChange={(e) => setMember({ ...member, position: e.target.value })}
                                                className="bg-transparent focus:outline-none w-full"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Sektör</label>
                                    <div className="relative">
                                        <select
                                            value={member.sector}
                                            onChange={(e) => setMember({ ...member, sector: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] bg-white appearance-none"
                                        >
                                            <option value="">Seçiniz...</option>
                                            {sectors.map((sector) => (
                                                <option key={sector} value={sector}>{sector}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">İş Alanı</label>
                                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                        <Briefcase className="w-4 h-4 text-[#0099CC]" />
                                        <input
                                            type="text"
                                            value={member.business_area || ''}
                                            onChange={(e) => setMember({ ...member, business_area: e.target.value })}
                                            className="font-medium bg-transparent focus:outline-none w-full"
                                            placeholder="Örn: Yapay Zeka, Enerji Hukuku vb."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Şirket Yıllık Cirosu</label>
                                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                            <Building2 className="w-4 h-4 text-[#0099CC]" />
                                            <input
                                                type="text"
                                                value={member.company_turnover || ''}
                                                onChange={(e) => setMember({ ...member, company_turnover: e.target.value })}
                                                className="font-medium bg-transparent focus:outline-none w-full"
                                                placeholder="Örn: 10M-50M TL"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Çalışan Sayısı</label>
                                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                            <User className="w-4 h-4 text-[#0099CC]" />
                                            <input
                                                type="text"
                                                value={member.number_of_employees || ''}
                                                onChange={(e) => setMember({ ...member, number_of_employees: e.target.value })}
                                                className="font-medium bg-transparent focus:outline-none w-full"
                                                placeholder="Örn: 50-100"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Column 2: Personal Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-3 border-b border-gray-100">
                                <User className="w-5 h-5 text-[#E53935]" />
                                Kişisel Bilgiler
                            </h2>
                            <div className="space-y-6">

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Doğum Tarihi</label>
                                        <input
                                            type="date"
                                            value={member.birth_date}
                                            onChange={(e) => setMember({ ...member, birth_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Medeni Durum</label>
                                        <select
                                            value={member.marital_status}
                                            onChange={(e) => setMember({ ...member, marital_status: e.target.value as 'married' | 'single' })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] bg-white"
                                        >
                                            <option value="married">Evli</option>
                                            <option value="single">Bekar</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Cinsiyet</label>
                                        <select
                                            value={member.gender || ''}
                                            onChange={(e) => setMember({ ...member, gender: e.target.value as 'male' | 'female' })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] bg-white"
                                        >
                                            <option value="">Seçiniz</option>
                                            <option value="male">Erkek</option>
                                            <option value="female">Kadın</option>
                                        </select>
                                    </div>
                                </div>


                                {/* Education Info */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block flex justify-between items-center">
                                        <span>Eğitim Bilgileri</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newEdu = [...(member.education || []), { level: 'Lisans', school: '', department: '', year: '' }];
                                                setMember({ ...member, education: newEdu });
                                            }}
                                            className="text-[10px] bg-[#0099CC]/10 text-[#0099CC] px-2 py-1 rounded hover:bg-[#0099CC]/20 transition-colors"
                                        >
                                            + Ekle
                                        </button>
                                    </label>

                                    <div className="space-y-3 mb-6">
                                        {(member.education || []).map((edu: any, index: number) => (
                                            <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg relative group">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newEdu = member.education.filter((_: any, i: number) => i !== index);
                                                        setMember({ ...member, education: newEdu });
                                                    }}
                                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>

                                                <div className="grid grid-cols-1 gap-2">
                                                    <select
                                                        value={edu.level}
                                                        onChange={(e) => {
                                                            const newEdu = [...member.education];
                                                            newEdu[index] = { ...newEdu[index], level: e.target.value };
                                                            setMember({ ...member, education: newEdu });
                                                        }}
                                                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:border-[#0099CC]"
                                                    >
                                                        <option value="Lise">Lise</option>
                                                        <option value="Önlisans">Önlisans</option>
                                                        <option value="Lisans">Lisans</option>
                                                        <option value="Yüksek Lisans">Yüksek Lisans</option>
                                                        <option value="Doktora">Doktora</option>
                                                        <option value="MBA">MBA</option>
                                                    </select>

                                                    <input
                                                        type="text"
                                                        placeholder="Okul Adı"
                                                        value={edu.school}
                                                        onChange={(e) => {
                                                            const newEdu = [...member.education];
                                                            newEdu[index] = { ...newEdu[index], school: e.target.value };
                                                            setMember({ ...member, education: newEdu });
                                                        }}
                                                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#0099CC]"
                                                    />

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Bölüm"
                                                            value={edu.department}
                                                            onChange={(e) => {
                                                                const newEdu = [...member.education];
                                                                newEdu[index] = { ...newEdu[index], department: e.target.value };
                                                                setMember({ ...member, education: newEdu });
                                                            }}
                                                            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#0099CC]"
                                                        />

                                                        <input
                                                            type="text"
                                                            placeholder="Yıl"
                                                            value={edu.year}
                                                            onChange={(e) => {
                                                                const newEdu = [...member.education];
                                                                newEdu[index] = { ...newEdu[index], year: e.target.value };
                                                                setMember({ ...member, education: newEdu });
                                                            }}
                                                            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#0099CC]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!member.education || member.education.length === 0) && (
                                            <div className="text-xs text-gray-400 italic text-center py-2 bg-gray-50/50 rounded border border-dashed border-gray-200">
                                                Eğitim eklenmemiş.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Yabancı Diller</label>
                                    <input
                                        type="text"
                                        value={member.languages?.join(', ')}
                                        onChange={(e) => setMember({ ...member, languages: e.target.value.split(',').map(s => s.trim()) })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC]"
                                        placeholder="İngilizce, Almanca..."
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Virgül ile ayırarak birden fazla dil ekleyebilirsiniz.</p>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Diğer Üyelikler</label>
                                    <textarea
                                        value={member.other_memberships || ''}
                                        onChange={(e) => setMember({ ...member, other_memberships: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] min-h-[80px]"
                                        placeholder="TÜSİAD, MÜSİAD vb."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Communication Info (New Row) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-3 border-b border-gray-100">
                                <Globe className="w-5 h-5 text-[#E53935]" />
                                İletişim Bilgileri
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">İletişim</label>
                                    <div className="flex flex-col gap-3">
                                        {(member.websites || ['']).map((site: string, i: number) => (
                                            <div key={i} className="flex items-center gap-2 group">
                                                <Globe className="w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={site}
                                                    onChange={(e) => {
                                                        const newWebsites = [...(member.websites || [''])];
                                                        newWebsites[i] = e.target.value;
                                                        setMember({ ...member, websites: newWebsites });
                                                    }}
                                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC]"
                                                    placeholder="www.ornek.com"
                                                />
                                                {(member.websites || ['']).length > 1 && (
                                                    <button
                                                        onClick={() => {
                                                            const newWebsites = member.websites.filter((_: any, idx: number) => idx !== i);
                                                            setMember({ ...member, websites: newWebsites });
                                                        }}
                                                        className="text-gray-400 hover:text-red-500 p-1"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {(!member.websites || member.websites.length < 3) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newWebsites = [...(member.websites || []), ''];
                                                    setMember({ ...member, websites: newWebsites });
                                                }}
                                                className="text-xs text-[#0099CC] hover:text-[#007aa3] font-medium self-start mt-1 flex items-center gap-1"
                                            >
                                                + Web Sitesi Ekle
                                            </button>
                                        )}
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <input
                                                type="email"
                                                value={member.email}
                                                onChange={(e) => setMember({ ...member, email: e.target.value })}
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC]"
                                                placeholder="ornek@email.com"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2 mt-2">
                                            <Linkedin className="w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={member.linkedin_url || ''}
                                                onChange={(e) => setMember({ ...member, linkedin_url: e.target.value })}
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC]"
                                                placeholder="LinkedIn Profil URL"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: GYIAD Info (Hybrid: Read-only + Editable) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2 relative">

                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-3 border-b border-gray-100">
                                <Award className="w-5 h-5 text-[#E53935]" />
                                GYİAD BİLGİLERİ
                            </h2>

                            {/* Row 1: Read-only visual fields (4 Columns) */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-5 bg-gray-50/80 rounded-xl border border-gray-100">

                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Üyelik Türü</label>
                                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#0099CC]/10 text-[#0099CC] border border-[#0099CC]/20">
                                        {member.member_type === 'active' ? 'Aktif Üye' :
                                            member.member_type === 'founder' ? 'Kurucu Üye' : member.member_type.toUpperCase()}
                                    </div>
                                </div>
                                <div className="md:border-l md:border-gray-200 md:pl-6">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Üyelik Tarihi</label>
                                    <div className="font-semibold text-gray-700 text-sm">{member.membership_date}</div>
                                </div>
                                <div className="md:border-l md:border-gray-200 md:pl-6">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Üyelik Bitiş Tarihi</label>
                                    <div className="font-semibold text-gray-700 text-sm">{(member as any).membership_end_date || '-'}</div>
                                </div>
                                <div className="md:border-l md:border-gray-200 md:pl-6">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Görevi</label>
                                    <div className="font-semibold text-gray-700 text-sm">
                                        {member.board_role === 'none' ? '-' :
                                            member.board_role === 'president' ? 'Başkan' :
                                                member.board_role === 'executive_board' ? 'İcra Kurulu' : 'Yönetim Kurulu'}
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Editable TextArea */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block flex justify-between items-end">
                                    <span>GYİAD Çalışmaları</span>
                                    <span className="text-[10px] font-normal normal-case text-gray-400 hidden sm:inline">GYİAD tarihindeki rolünüzü ve katkılarınızı detaylandırınız.</span>
                                </label>
                                <textarea
                                    ref={projectsRef}
                                    value={member.gyiad_projects || ''}
                                    onChange={(e) => {
                                        setMember({ ...member, gyiad_projects: e.target.value });
                                    }}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] min-h-[150px] text-sm leading-relaxed text-gray-700 resize-none overflow-hidden bg-white"
                                    placeholder="GYİAD bünyesinde yer aldığınız komiteler, projeler ve katkılarınızı buraya yazınız..."
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = target.scrollHeight + 'px';
                                    }}
                                />
                            </div>
                        </div>

                    </div>

                    {/* KVKK Checkbox Area */}
                    <div className="mx-6 mt-6 bg-white rounded-xl p-4 border border-gray-100 flex items-start gap-3">
                        <div className="flex items-center h-5 mt-1">
                            <input
                                id="kvkk-consent"
                                type="checkbox"
                                checked={member.kvkk_consent || false}
                                onChange={(e) => setMember({ ...member, kvkk_consent: e.target.checked })}
                                className="w-5 h-5 text-[#0099CC] border-gray-300 rounded focus:ring-[#0099CC]"
                            />
                        </div>
                        <div className="text-sm">
                            <label htmlFor="kvkk-consent" className="font-medium text-gray-700 cursor-pointer select-none">
                                <span className="text-[#0099CC] font-bold hover:underline" onClick={(e) => {
                                    e.preventDefault();
                                    setShowKvkkModal(true);
                                }}>
                                    KVKK Aydınlatma Metni'ni
                                </span> okudum ve kabul ediyorum.
                            </label>
                            <p className="text-gray-500 text-xs mt-1">Profilinizdeki değişiklikleri kaydedebilmeniz için bu metni onaylamanız gerekmektedir.</p>
                        </div>
                    </div>

                </div>
            </main>

            {/* KVKK Modal */}
            {showKvkkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-[#0099CC]" />
                                KVKK Aydınlatma Metni
                            </h3>
                            <button
                                onClick={() => setShowKvkkModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh] text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">
                            {kvkkText}
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={() => setShowKvkkModal(false)}
                                className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Kapat
                            </button>
                            <button
                                onClick={() => {
                                    setMember({ ...member, kvkk_consent: true });
                                    setShowKvkkModal(false);
                                }}
                                className="px-5 py-2.5 bg-[#0099CC] text-white font-medium hover:bg-[#007aa3] rounded-lg transition-colors shadow-sm"
                            >
                                Okudum, Onaylıyorum
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

