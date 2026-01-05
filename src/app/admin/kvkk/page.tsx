'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { memberService } from '@/services/memberService';

export default function AdminKvkkPage() {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadKvkkText();
    }, []);

    const loadKvkkText = async () => {
        try {
            const kvkkText = await memberService.getKvkkText();
            setText(kvkkText || '');
        } catch (error) {
            console.error('Failed to load KVKK text', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await memberService.updateKvkkText(text);
            alert('KVKK metni başarıyla güncellendi.');
        } catch (error: any) {
            console.error('Failed to save KVKK text', error);
            alert(`Kaydetme hatası: ${error.message || 'Bilinmeyen hata'}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">KVKK Metni Yönetimi</h1>
            <p className="text-gray-500 mb-4">Üyelerin onaylaması gereken KVKK (Kişisel Verilerin Korunması Kanunu) aydınlatma metnini buradan düzenleyebilirsiniz.</p>



            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-4 bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-3 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold">Bilgilendirme</p>
                        <p>Bu alana metni düz yazı olarak girebilirsiniz. Satır boşlukları olduğu gibi korunacaktır.</p>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Aydınlatma Metni</label>
                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                            Loading...
                        </div>
                    ) : (
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-transparent outline-none font-mono text-sm"
                            placeholder="KVKK Metnini buraya giriniz..."
                        />
                    )}
                </div>

                <div className="flex justify-end">
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
