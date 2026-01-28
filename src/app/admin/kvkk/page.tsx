'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { memberService } from '@/services/memberService';

export default function AdminKvkkPage() {
    const [texts, setTexts] = useState({
        membership: '',
        newsletter: '',
        photoSharing: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadKvkkTexts();
    }, []);

    const loadKvkkTexts = async () => {
        try {
            const kvkkTexts = await memberService.getKvkkTexts();
            setTexts(kvkkTexts);
        } catch (error) {
            console.error('Failed to load KVKK texts', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await memberService.updateKvkkTexts(texts);
            alert('KVKK metinleri başarıyla güncellendi.');
        } catch (error: any) {
            console.error('Failed to save KVKK texts', error);
            alert(`Kaydetme hatası: ${error.message || 'Bilinmeyen hata'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (key: keyof typeof texts, value: string) => {
        setTexts(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">KVKK Metni Yönetimi</h1>
            <p className="text-gray-500 mb-4">Üyelerin onaylaması gereken açık rıza metinlerini buradan düzenleyebilirsiniz.</p>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-8">
                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-3 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold">Bilgilendirme</p>
                        <p>Bu alanlara metinleri düz yazı veya HTML olarak girebilirsiniz. Satır boşlukları olduğu gibi korunacaktır.</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                        Loading...
                    </div>
                ) : (
                    <>
                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-2">1. GYİAD Dernek Vakıf Üyeliği Açık Rıza Metni</label>
                            <textarea
                                value={texts.membership}
                                onChange={(e) => handleChange('membership', e.target.value)}
                                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-transparent outline-none font-mono text-sm"
                                placeholder="Üyelik açık rıza metnini buraya giriniz..."
                            />
                        </div>

                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-2">2. GYİAD E-Bülten Açık Rıza Metni</label>
                            <textarea
                                value={texts.newsletter}
                                onChange={(e) => handleChange('newsletter', e.target.value)}
                                className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-transparent outline-none font-mono text-sm"
                                placeholder="E-Bülten açık rıza metnini buraya giriniz..."
                            />
                        </div>

                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-2">3. GYİAD Fotoğraf Paylaşımı Açık Rıza Metni</label>
                            <textarea
                                value={texts.photoSharing}
                                onChange={(e) => handleChange('photoSharing', e.target.value)}
                                className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-transparent outline-none font-mono text-sm"
                                placeholder="Fotoğraf paylaşımı açık rıza metnini buraya giriniz..."
                            />
                        </div>
                    </>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#0099CC] hover:bg-[#007aa3] text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50"
                    >
                        {isSaving ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </button>
                </div>
            </div>
        </div>
    );
}
