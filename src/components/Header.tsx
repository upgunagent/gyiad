'use client';

import { Search } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { sectors } from '@/data/sectors';

export default function Header({ title = "AKTİF ÜYELER" }: { title?: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const currentYear = new Date().getFullYear();


    return (
        <header className="flex flex-col md:flex-row md:items-center justify-end gap-4 mb-8">
            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Sector Filter */}
                <select
                    onChange={(e) => {
                        const params = new URLSearchParams(searchParams);
                        if (e.target.value) {
                            params.set('sector', e.target.value);
                        } else {
                            params.delete('sector');
                        }
                        replace(`${pathname}?${params.toString()}`);
                    }}
                    value={searchParams.get('sector') || ''}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] bg-white text-gray-700 min-w-[200px]"
                >
                    <option value="">Tüm Sektörler</option>
                    {sectors.map((sector) => (
                        <option key={sector} value={sector}>{sector}</option>
                    ))}
                </select>

                {/* Gender Filter */}
                <select
                    onChange={(e) => {
                        const params = new URLSearchParams(searchParams);
                        if (e.target.value) {
                            params.set('gender', e.target.value);
                        } else {
                            params.delete('gender');
                        }
                        replace(`${pathname}?${params.toString()}`);
                    }}
                    value={searchParams.get('gender') || ''}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] bg-white text-gray-700 w-[150px]"
                >
                    <option value="">Cinsiyet</option>
                    <option value="male">Erkek</option>
                    <option value="female">Kadın</option>
                </select>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Üye Ara..."
                        onChange={(e) => handleSearch(e.target.value)}
                        defaultValue={searchParams.get('search')?.toString()}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0099CC]/20 focus:border-[#0099CC] w-64 shadow-sm"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
            </div>
        </header>
    );
}
