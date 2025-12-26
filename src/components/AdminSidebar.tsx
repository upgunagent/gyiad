'use client';

import {
    Users,
    Home,
    Settings,
    LogOut,
    Menu,
    X,
    UserPlus,
    LayoutDashboard,
    KeyRound,
    MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

// Reusing NavItem logic but specific for Admin
function NavItem({ icon: Icon, label, href, active }: { icon: any, label: string, href: string, active?: boolean }) {
    return (
        <Link href={href} className={clsx(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
            active ? "bg-[#0099CC]/10 text-[#0099CC] font-bold" : "text-gray-600 hover:bg-gray-50 hover:text-[#0099CC]"
        )}>
            <Icon className={clsx("w-5 h-5", active ? "text-[#0099CC]" : "text-gray-400 group-hover:text-[#0099CC]")} />
            <span>{label}</span>
        </Link>
    )
}

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);
    const [userName, setUserName] = useState('Admin');

    useEffect(() => {
        async function loadUser() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserName(user.email?.split('@')[0] || 'Admin');
            }
        }
        loadUser();
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
            >
                {isOpen ? <X /> : <Menu />}
            </button>

            {/* Sidebar */}
            <aside className={clsx(
                "fixed top-0 left-0 z-40 h-screen w-72 bg-white border-r border-gray-100 transition-transform duration-300 flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Header */}
                <div className="p-6 border-b border-gray-50 flex flex-col items-center justify-center text-center">
                    <div className="relative w-full h-40 mb-4">
                        <Image
                            src="/logo.png"
                            alt="GYİAD"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Admin Paneli</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-4">Yönetim</div>
                    {/* Dashboard Removed */}

                    <NavItem
                        icon={Users}
                        label="Üye Listesi"
                        href="/admin/members"
                        active={pathname === '/admin/members'}
                    />
                    <NavItem
                        icon={UserPlus}
                        label="Yeni Üye Ekle"
                        href="/admin/members/new"
                        active={pathname === '/admin/members/new'}
                    />
                    <NavItem
                        icon={MessageSquare}
                        label="Dilek ve Talepler"
                        href="/admin/requests"
                        active={pathname === '/admin/requests'}
                    />

                    {/* Settings Removed */}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-50">
                    {/* User Name - Clickable for Password Change */}
                    <Link
                        href="/admin/change-password"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors mb-2"
                    >
                        <KeyRound className="w-4 h-4 text-gray-400" />
                        <div>
                            <div className="text-sm font-semibold">{userName}</div>
                            <div className="text-xs text-gray-400">Şifre değiştir</div>
                        </div>
                    </Link>

                    {/* Logout Button - Red */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Çıkış Yap</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
