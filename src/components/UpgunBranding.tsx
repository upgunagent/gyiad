'use client';

import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

export default function UpgunBranding() {
    const pathname = usePathname();
    const [isLogin, setIsLogin] = useState(false);

    useEffect(() => {
        setIsLogin(pathname === '/login');
    }, [pathname]);

    // Don't render on server or hydration mismatch might occur, but for this simple visual,
    // a simple useEffect check or just using pathname directly is fine if we suppress hydration warning
    // or just accept initial render matches server (which doesn't access pathname same way usually).
    // Better: Styles that adapt or just force client side solely.

    // Actually, simplest is to return null until mounted to avoid hydration errors if pathname varies
    // but here we want SEO/visuals ASAP. 
    // Let's use standard Next.js pattern.

    if (pathname === '/login') {
        return (
            <a
                href="https://www.upgunai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-4 right-6 z-[9999] flex items-center gap-2 text-[10px] text-white/90 font-medium tracking-wide hover:text-white transition-colors"
            >
                <span>Bu web sitesi UPGUN AI (www.upgunai.com) tarafından tasarlanmıştır.</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/upgun-logo.png"
                    alt="UPGUN AI"
                    className="h-5 w-auto object-contain bg-white/10 rounded px-1"
                />
            </a>
        );
    }

    // New Hover Style for App
    return (
        <div className="fixed bottom-4 right-4 z-[9999] group flex flex-row-reverse items-center">
            <a
                href="https://www.upgunai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 block bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-100 p-1 hover:bg-white transition-all cursor-pointer"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/upgun-logo.png"
                    alt="UPGUN AI"
                    className="h-6 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
            </a>

            <div className="mr-[-15px] pr-6 pl-4 py-1.5 bg-white/90 backdrop-blur-md rounded-l-full shadow-sm border border-gray-100 
                          translate-x-4 opacity-0 scale-x-75 origin-right pointer-events-none transition-all duration-300 ease-out
                          group-hover:translate-x-0 group-hover:opacity-100 group-hover:scale-x-100 group-hover:pointer-events-auto">
                <a
                    href="https://www.upgunai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-gray-600 font-medium whitespace-nowrap hover:text-[#0099CC] transition-colors"
                >
                    Bu web sitesi UPGUN AI (www.upgunai.com) tarafından tasarlanmıştır.
                </a>
            </div>
        </div>
    );
}
