'use client';

import { useState } from 'react';
import { Loader2, Save, Plus, Trash2, Building2, User, Globe, Camera } from 'lucide-react';
import { sectors } from '@/data/sectors';
import Image from 'next/image';

export default function NewMemberPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Initial State
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        membership_category: 'individual',
        membership_status: 'active',
        membership_start_date: new Date().toISOString().split('T')[0],
        membership_end_date: '',
        board_roles: [] as string[],
        card_role: '',
        // New Fields
        company_name: '',
        company_address: '',
        position: '',
        sector: '',
        business_area: '',
        birth_date: '',
        marital_status: 'single',
        gender: '',
        linkedin_url: '',
        websites: [''],
        education: [] as any[],
        languages: [] as string[],
        other_memberships: '',
        gyiad_projects: ''
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        // Sanitize data
        const dataToSend = {
            ...formData,
            websites: formData.websites.filter(w => w.trim() !== ''),
        };

        try {
            const res = await fetch('/api/admin/create-member', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.error || 'Bir hata oluştu');

            const userId = result.userId;

            // 2. Upload Avatar if selected
            if (userId && avatarFile) {
                const formData = new FormData();
                formData.append('file', avatarFile);
                formData.append('userId', userId);

                const uploadRes = await fetch('/api/admin/upload-avatar', {
                    method: 'POST',
                    body: formData
                });

                if (!uploadRes.ok) {
                    console.error('Avatar upload failed');
                    setMessage({ text: 'Üye oluşturuldu ancak fotoğraf yüklenemedi.', type: 'error' });
                    return;
                }

                const { publicUrl } = await uploadRes.json();

                // 3. Update Profile with Avatar URL
                await fetch(`/api/admin/members/${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ avatar_url: publicUrl })
                });
            }

            setMessage({ text: 'Üye kaydı tamamlanmıştır. Üye\'ye bilgiler mail yoluyla iletilmiştir.', type: 'success' });
            // Ideally redirect or clear form, here we keep it to show success
            window.scrollTo(0, 0);
        } catch (err: any) {
            setMessage({ text: err.message, type: 'error' });
            window.scrollTo(0, 0);
        } finally {
            setIsLoading(false);
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

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Yeni Üye Kaydı</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {message && (
                    <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
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
                        <p className="text-xs text-gray-500 mt-2">Profil Fotoğrafı Ekle (Opsiyonel)</p>
                    </div>

                    {/* 1. Temel Üyelik Bilgileri */}
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
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0099CC] bg-gray-50"
                                />
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
                                    <option value="corporate">Kurumsal Üye</option>
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

                            <BoardRoleGroup
                                label="Yönetim Kurulu Üyesi"
                                onChange={roles => setFormData({ ...formData, board_roles: roles })}
                                currentRoles={formData.board_roles}
                                regularId="board_member"
                                reserveId="board_reserve"
                            />
                            <BoardRoleGroup
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
                            disabled={isLoading}
                            className="bg-[#0099CC] hover:bg-[#007da6] text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg shadow-[#0099CC]/20"
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

interface BoardRoleGroupProps {
    label: string;
    currentRoles: string[];
    onChange: (roles: string[]) => void;
    regularId: string;
    reserveId: string;
}

function BoardRoleGroup({ label, currentRoles, onChange, regularId, reserveId }: BoardRoleGroupProps) {
    const isRegular = currentRoles.includes(regularId);
    const isReserve = currentRoles.includes(reserveId);
    const isActive = isRegular || isReserve;
    const subRole = isReserve ? 'reserve' : 'regular';

    const handleCheck = (checked: boolean) => {
        let newRoles = [...currentRoles].filter((r: string) => r !== regularId && r !== reserveId);
        if (checked) newRoles.push(regularId);
        onChange(newRoles);
    };

    const handleSubChange = (val: string) => {
        let newRoles = [...currentRoles].filter((r: string) => r !== regularId && r !== reserveId);
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
