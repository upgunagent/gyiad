'use client';

import { useState, useEffect, use } from 'react';
import { Loader2, Save, Plus, Trash2, Building2, User, Globe, ArrowLeft, Camera, Pencil, EyeOff } from 'lucide-react';
import { sectors } from '@/data/sectors';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        membership_category: 'individual',
        membership_status: 'active',
        membership_start_date: '',
        membership_end_date: '',
        board_roles: [] as string[],
        card_role: '',
        is_hidden: false,
        company_name: '',
        company_address: '',
        position: '',
        sector: '',
        business_area: '',
        birth_date: '',
        marital_status: '',
        gender: '',
        linkedin_url: '',
        websites: [''],
        education: [] as any[],
        languages: [] as string[],
        other_memberships: '',
        gyiad_projects: '',
        company_turnover: '',
        number_of_employees: ''
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isEmailEditable, setIsEmailEditable] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        const loadMember = async () => {
            try {
                const res = await fetch(`/api/admin/members/${id}`);
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || 'Üye bilgileri alınamadı');

                setFormData({
                    ...formData, // Spread existing defaults first to ensure all keys exist
                    full_name: data.full_name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    membership_category: data.membership_category || 'individual',
                    membership_status: data.member_type || 'active', // Map DB 'member_type' to frontend 'status'
                    membership_start_date: data.membership_date || '',
                    membership_end_date: data.membership_end_date || '',
                    board_roles: data.board_roles || [],
                    card_role: data.card_role || '',
                    is_hidden: data.is_hidden || false,
                    company_name: data.company_name || '',
                    company_address: data.company_address || '',
                    position: data.position || '',
                    sector: data.sector || '',
                    business_area: data.business_area || '',
                    birth_date: data.birth_date || '',
                    marital_status: data.marital_status || '',
                    gender: data.gender || '',
                    linkedin_url: data.linkedin_url || '',
                    websites: (data.websites && data.websites.length > 0) ? data.websites : [''],
                    education: Array.isArray(data.education) ? data.education : [],
                    languages: Array.isArray(data.languages) ? data.languages : [],
                    other_memberships: data.other_memberships || '',
                    gyiad_projects: data.gyiad_projects || '',
                    company_turnover: data.company_turnover || '',
                    number_of_employees: data.number_of_employees || ''
                });
                if (data.avatar_url) {
                    setAvatarPreview(data.avatar_url);
                }
            } catch (err: any) {
                setMessage({ text: err.message, type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };

        loadMember();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        let avatarUrl = null;

        if (avatarFile) {
            const uploadFormData = new FormData();
            uploadFormData.append('file', avatarFile);
            uploadFormData.append('userId', id);

            try {
                const uploadRes = await fetch('/api/admin/upload-avatar', {
                    method: 'POST',
                    body: uploadFormData
                });

                if (uploadRes.ok) {
                    const { publicUrl } = await uploadRes.json();
                    avatarUrl = publicUrl;
                }
            } catch (error) {
                console.error('Avatar upload failed:', error);
            }
        }

        const dataToSend = {
            ...formData,
            marital_status: formData.marital_status || null,
            ...(avatarUrl && { avatar_url: avatarUrl }),
            websites: formData.websites.filter(w => w.trim() !== ''),
        };

        try {
            const res = await fetch(`/api/admin/members/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.error || 'Bir hata oluştu');

            setMessage({ text: 'Üye bilgileri güncellendi.', type: 'success' });
            window.scrollTo(0, 0);
        } catch (err: any) {
            setMessage({ text: err.message, type: 'error' });
            window.scrollTo(0, 0);
        } finally {
            setIsSaving(false);
        }
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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#0099CC]" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-6">
                <Link href="/admin/members" className="text-sm text-gray-500 hover:text-[#0099CC] flex items-center gap-1 mb-2">
                    <ArrowLeft className="w-4 h-4" />
                    Listeye Dön
                </Link>
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Üye Düzenle</h1>
                    <button
                        type="submit"
                        form="edit-member-form"
                        disabled={isSaving}
                        className="bg-[#0099CC] hover:bg-[#007da6] text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md shadow-[#0099CC]/20 text-sm"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Kaydediliyor...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Kaydet
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {message && (
                    <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form id="edit-member-form" onSubmit={handleSubmit} className="space-y-8">
                    {/* 0. Profil Fotoğrafı */}
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                                {avatarPreview ? (
                                    <Image
                                        src={avatarPreview}
                                        alt="Avatar Preview"
                                        width={128}
                                        height={128}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-12 h-12 text-gray-400" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-[#0099CC] hover:bg-[#007da6] text-white p-2 rounded-full cursor-pointer shadow-md transition-colors">
                                <Camera className="w-4 h-4" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Gizli Üye Checkbox */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-200 rounded-full text-gray-700">
                                <EyeOff className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Üyeyi Listelerde Gizle</h3>
                                <p className="text-xs text-gray-500">Bu seçenek işaretlendiğinde, üye listelerde ve arama sonuçlarında görünmez ancak panele erişebilir.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_hidden}
                                onChange={(e) => setFormData({ ...formData, is_hidden: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0099CC]"></div>
                        </label>
                    </div>

                    {/* 1. Temel Hesap Bilgileri */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Hesap Bilgileri</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                                <input
                                    required
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        disabled={!isEmailEditable}
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className={`w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] 
                                            ${isEmailEditable ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}`}
                                        title={isEmailEditable ? "E-posta adresini düzenleyin" : "E-posta adresini değiştirmek için kalem ikonuna tıklayın"}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsEmailEditable(!isEmailEditable)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#0099CC] hover:bg-blue-50 rounded-md transition-colors"
                                        title="E-posta adresini düzenle"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </div>
                                {isEmailEditable && (
                                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                        ⚠️ Dikkat: E-posta değiştiğinde üyenin giriş yaparken kullandığı adres de değişecektir.
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
                                <input
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
                                    placeholder="+90 5XX XXX XX XX"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Kurumsal Bilgiler */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-gray-500" />
                            Kurumsal Bilgiler
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Adı</label>
                                <input
                                    value={formData.company_name}
                                    onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Adresi</label>
                                <textarea
                                    value={formData.company_address}
                                    onChange={e => setFormData({ ...formData, company_address: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50 h-24"
                                    placeholder="Tam adres..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pozisyon</label>
                                <input
                                    value={formData.position}
                                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sektör</label>
                                <select
                                    value={formData.sector}
                                    onChange={e => setFormData({ ...formData, sector: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
                                >
                                    <option value="">Seçiniz</option>
                                    {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">İş Alanı</label>
                                <input
                                    value={formData.business_area}
                                    onChange={e => setFormData({ ...formData, business_area: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
                                    placeholder="Örn: Yazılım, İnşaat vb."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Yıllık Cirosu</label>
                                <input
                                    value={formData.company_turnover}
                                    onChange={e => setFormData({ ...formData, company_turnover: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
                                    placeholder="Örn: 10M - 50M TL"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Çalışan Sayısı</label>
                                <input
                                    value={formData.number_of_employees}
                                    onChange={e => setFormData({ ...formData, number_of_employees: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
                                    placeholder="Örn: 50 - 100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. Kişisel Bilgiler */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-500" />
                            Kişisel Bilgiler
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi</label>
                                <input
                                    type="date"
                                    value={formData.birth_date}
                                    onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medeni Durum</label>
                                <select
                                    value={formData.marital_status}
                                    onChange={e => setFormData({ ...formData, marital_status: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
                                >
                                    <option value="">Seçiniz</option>
                                    <option value="single">Bekar</option>
                                    <option value="married">Evli</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet</label>
                                <select
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
                                >
                                    <option value="">Seçiniz</option>
                                    <option value="male">Erkek</option>
                                    <option value="female">Kadın</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Diğer Üyelikler</label>
                            <textarea
                                value={formData.other_memberships}
                                onChange={e => setFormData({ ...formData, other_memberships: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50 h-24"
                                placeholder="TÜSİAD, MÜSİAD vb."
                            />
                        </div>
                    </div>

                    {/* 4. Eğitim Bilgileri */}
                    <div>
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 className="text-lg font-semibold text-gray-900">Eğitim Bilgileri</h2>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, education: [...formData.education, { level: 'Lisans', school: '', department: '', year: '' }] })}
                                className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Ekle
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.education.map((edu, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative group">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, education: formData.education.filter((_, i) => i !== index) })}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <select
                                            value={edu.level}
                                            onChange={e => {
                                                const newEdu = [...formData.education];
                                                newEdu[index].level = e.target.value;
                                                setFormData({ ...formData, education: newEdu });
                                            }}
                                            className="px-3 py-2 border border-gray-200 rounded text-sm"
                                        >
                                            <option value="Lise">Lise</option>
                                            <option value="Önlisans">Önlisans</option>
                                            <option value="Lisans">Lisans</option>
                                            <option value="Yüksek Lisans">Yüksek Lisans</option>
                                            <option value="Doktora">Doktora</option>
                                            <option value="MBA">MBA</option>
                                        </select>
                                        <input
                                            placeholder="Okul Adı"
                                            value={edu.school}
                                            onChange={e => {
                                                const newEdu = [...formData.education];
                                                newEdu[index].school = e.target.value;
                                                setFormData({ ...formData, education: newEdu });
                                            }}
                                            className="px-3 py-2 border border-gray-200 rounded text-sm md:col-span-2"
                                        />
                                        <input
                                            placeholder="Bölüm"
                                            value={edu.department}
                                            onChange={e => {
                                                const newEdu = [...formData.education];
                                                newEdu[index].department = e.target.value;
                                                setFormData({ ...formData, education: newEdu });
                                            }}
                                            className="px-3 py-2 border border-gray-200 rounded text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                            {formData.education.length === 0 && <p className="text-sm text-gray-400 italic">Henüz eğitim bilgisi eklenmemiş.</p>}
                        </div>
                    </div>

                    {/* 5. İletişim ve Sosyal Medya */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-gray-500" />
                            İletişim ve Diğer
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                                <input
                                    value={formData.linkedin_url}
                                    onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Yabancı Diller</label>
                                <input
                                    value={formData.languages.join(', ')}
                                    onChange={e => setFormData({ ...formData, languages: e.target.value.split(',').map(s => s.trim()) })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
                                    placeholder="İngilizce, Almanca (Virgülle ayırın)"
                                />
                            </div>
                        </div>

                        {/* Websites */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Web Siteleri</label>
                            {formData.websites.map((site, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        value={site}
                                        onChange={e => {
                                            const newWebsites = [...formData.websites];
                                            newWebsites[index] = e.target.value;
                                            setFormData({ ...formData, websites: newWebsites });
                                        }}
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
                                        placeholder="www.ornek.com"
                                    />
                                    {formData.websites.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, websites: formData.websites.filter((_, i) => i !== index) })}
                                            className="text-red-400 hover:text-red-600 p-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, websites: [...formData.websites, ''] })}
                                className="text-sm text-[#0099CC] hover:underline"
                            >
                                + Web Sitesi Ekle
                            </button>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">GYİAD Çalışmaları</label>
                            <textarea
                                value={formData.gyiad_projects}
                                onChange={e => setFormData({ ...formData, gyiad_projects: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50 h-24"
                                placeholder="Komiteler, projeler vb."
                            />
                        </div>
                    </div>

                    {/* 6. Üyelik Statüsü */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Üyelik Detayları</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Üyelik Türü</label>
                                <select
                                    value={formData.membership_category}
                                    onChange={e => setFormData({ ...formData, membership_category: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
                                >
                                    <option value="individual">Bireysel Üye</option>
                                    <option value="corporate">Tüzel Üye</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Üyelik Durumu</label>
                                <select
                                    value={formData.membership_status}
                                    onChange={e => setFormData({ ...formData, membership_status: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
                                >
                                    <option value="active">Aktif Üye</option>
                                    <option value="honorary">Fahri Üye</option>
                                    <option value="left">Ayrılmış Üye</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                                <input
                                    type="date"
                                    value={formData.membership_start_date}
                                    onChange={e => setFormData({ ...formData, membership_start_date: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                                <input
                                    type="date"
                                    value={formData.membership_end_date}
                                    onChange={e => setFormData({ ...formData, membership_end_date: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 7. Yönetim Görevleri */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Yönetim Görevleri</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                            {[
                                { id: 'president', label: 'Yönetim Kurulu Başkanı' },
                                { id: 'vice_president', label: 'Başkan Yardımcısı' },
                                { id: 'executive_board', label: 'İcra Kurulu Üyesi' },
                                { id: 'high_advisory_board', label: 'Yüksek İstişare Kurulu Üyesi' },
                                { id: 'founder', label: 'Kurucu Üye' },
                                { id: 'past_president', label: 'Geçmiş Dönem YK Başkanı' }
                            ].map((role) => (
                                <label key={role.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                    <input
                                        type="checkbox"
                                        checked={formData.board_roles.includes(role.id)}
                                        onChange={e => handleRoleChange(role.id, e.target.checked)}
                                        className="w-4 h-4 text-[#0099CC] rounded focus:ring-[#0099CC]"
                                    />
                                    <span className="text-sm text-gray-700">{role.label}</span>
                                </label>
                            ))}

                            <EditRoleGroup
                                label="Yönetim Kurulu Üyesi"
                                onChange={roles => setFormData({ ...formData, board_roles: roles })}
                                currentRoles={formData.board_roles}
                                regularId="board_member"
                                reserveId="board_reserve"
                            />
                            <EditRoleGroup
                                label="Denetleme Kurulu Üyesi"
                                onChange={roles => setFormData({ ...formData, board_roles: roles })}
                                currentRoles={formData.board_roles}
                                regularId="audit_board"
                                reserveId="audit_reserve"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Üye Kartında Gözükecek Ünvan</label>
                            <p className="text-xs text-gray-500 mb-2">Fotoğraf altında görünecek öncelikli ünvan.</p>
                            <select
                                value={formData.card_role}
                                onChange={e => setFormData({ ...formData, card_role: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
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
                    </div>


                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-[#0099CC] hover:bg-[#007da6] text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg shadow-[#0099CC]/20"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Değişiklikleri Kaydet
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface EditRoleGroupProps {
    label: string;
    currentRoles: string[];
    onChange: (roles: string[]) => void;
    regularId: string;
    reserveId: string;
}

function EditRoleGroup({ label, currentRoles, onChange, regularId, reserveId }: EditRoleGroupProps) {
    const isRegular = currentRoles.includes(regularId);
    const isReserve = currentRoles.includes(reserveId);
    const isActive = isRegular || isReserve;
    const subRole = isReserve ? 'reserve' : 'regular';

    const handleCheck = (checked: boolean) => {
        let newRoles = [...currentRoles].filter((r: any) => r !== regularId && r !== reserveId);
        if (checked) newRoles.push(regularId);
        onChange(newRoles);
    };

    const handleSubChange = (val: string) => {
        let newRoles = [...currentRoles].filter((r: any) => r !== regularId && r !== reserveId);
        newRoles.push(val === 'regular' ? regularId : reserveId);
        onChange(newRoles);
    };

    return (
        <div className={`p-2 rounded border border-transparent ${isActive ? 'bg-blue-50 border-blue-100' : ''}`}>
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => handleCheck(e.target.checked)}
                    className="w-4 h-4 text-[#0099CC] rounded focus:ring-[#0099CC]"
                />
                <span className="text-sm text-gray-700">{label}</span>
            </label>
            {isActive && (
                <div className="ml-6 mt-2">
                    <select
                        value={subRole}
                        onChange={(e) => handleSubChange(e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                        <option value="regular">Asil Üye</option>
                        <option value="reserve">Yedek Üye</option>
                    </select>
                </div>
            )}
        </div>
    );
}
