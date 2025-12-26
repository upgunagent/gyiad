'use client';

import { useState, useEffect, Suspense } from 'react';
import {
    Users,
    ChevronDown,
    ChevronRight,
    User,
    Settings,
    LogOut,
    MessageSquare,
    LayoutDashboard,
    ShieldCheck,
    Award,
    BookOpen,
    History,
    KeyRound
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { memberService } from '@/services/memberService';

// Main Component with Suspense Wrapper
export default function Sidebar() {
    return (
        <Suspense fallback={<div className="w-72 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-50 shadow-sm"></div>}>
            <SidebarContent />
        </Suspense>
    );
}

// Inner Component with Logic
function SidebarContent() {
    const [boardExpanded, setBoardExpanded] = useState(false);
    const [auditExpanded, setAuditExpanded] = useState(false);
    const [userName, setUserName] = useState('');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Helper to determine if a link is active
    const isActive = (href: string) => {
        // Handle filter links (e.g., /?filter=president)
        if (href.includes('?filter=')) {
            const filterValue = href.split('=')[1];
            const currentFilter = searchParams.get('filter');
            return currentFilter === filterValue;
        }
        // Handle page links (e.g., /profile)
        // Exact match or starts with (for subpages if any)
        if (href === '/') return pathname === '/' && !searchParams.get('filter');
        return pathname === href || pathname.startsWith(href);
    };

    useEffect(() => {
        async function loadUser() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const profile = await memberService.getProfile(user.id);
                setUserName(profile?.full_name || user.email?.split('@')[0] || 'Üye');
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
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-50 shadow-sm">
            {/* Logo Area */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-center">
                <div className="relative w-35 h-35">
                    <Image
                        src="/logo.png"
                        alt="GYİAD Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 font-medium">

                {/* Group 1: Board & Management */}
                <div className="space-y-1">
                    <NavItem icon={User} label="Başkan" href="/?filter=president" active={isActive("/?filter=president")} />
                    <NavItem icon={ShieldCheck} label="İcra Kurulu" href="/?filter=executive" active={isActive("/?filter=executive")} />

                    {/* Accordion - Board */}
                    <div>
                        <button
                            onClick={() => setBoardExpanded(!boardExpanded)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-[#0099CC] transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5" />
                                <span>Yönetim Kurulu</span>
                            </div>
                            {boardExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        </button>

                        {boardExpanded && (
                            <div className="ml-9 mt-1 space-y-1 relative before:absolute before:left-[-17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                                <NavItem label="Tüm Üyeler" small href="/?filter=board_all" active={isActive("/?filter=board_all")} />
                                <NavItem label="Asil Üyeler" small href="/?filter=board_regular" active={isActive("/?filter=board_regular")} />
                                <NavItem label="Yedek Üyeler" small href="/?filter=board_reserve" active={isActive("/?filter=board_reserve")} />
                            </div>
                        )}
                    </div>

                    {/* Audit Board Accordion */}
                    <div>
                        <button
                            onClick={() => setAuditExpanded(!auditExpanded)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-[#0099CC] transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5" />
                                <span>Denetleme Kurulu</span>
                            </div>
                            {auditExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        </button>

                        {auditExpanded && (
                            <div className="ml-9 mt-1 space-y-1 relative before:absolute before:left-[-17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                                <NavItem label="Asil Üyeler" small href="/?filter=audit_regular" active={isActive("/?filter=audit_regular")} />
                                <NavItem label="Yedek Üyeler" small href="/?filter=audit_reserve" active={isActive("/?filter=audit_reserve")} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t-2 border-gray-200 my-4" />

                {/* Group 2: Active & Honorary */}
                <div className="space-y-1">
                    <NavItem icon={LayoutDashboard} label="Aktif Üyeler" href="/?filter=active" active={isActive("/?filter=active")} />
                    <NavItem icon={Award} label="Fahri Üyeler" href="/?filter=honorary" active={isActive("/?filter=honorary")} />
                </div>

                <div className="border-t-2 border-gray-200 my-4" />

                {/* Group 3: Advisory & History */}
                <div className="space-y-1">
                    <NavItem icon={MessageSquare} label="Yüksek İstişare Kurulu" href="/?filter=advisory" active={isActive("/?filter=advisory")} />
                    <NavItem icon={User} label="Kurucu Üyeler" href="/?filter=founders" active={isActive("/?filter=founders")} />
                    <NavItem icon={History} label="Eski Başkanlar" href="/?filter=past_presidents" active={isActive("/?filter=past_presidents")} />
                </div>

            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                <div className="space-y-1">
                    {/* User Name - Clickable for Password Change */}
                    <Link
                        href="/change-password"
                        className={clsx(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-2",
                            isActive("/change-password") ? "bg-[#0099CC]/10 text-[#0099CC]" : "text-gray-700 hover:bg-gray-100"
                        )}
                    >
                        <KeyRound className={clsx("w-4 h-4", isActive("/change-password") ? "text-[#0099CC]" : "text-gray-400")} />
                        <div>
                            <div className="text-sm font-semibold">{userName || 'Üye'}</div>
                            <div className="text-xs opacity-70">Şifre değiştir</div>
                        </div>
                    </Link>

                    <NavItem icon={User} label="Profilim" href="/profile" active={isActive("/profile")} />
                    <NavItem icon={MessageSquare} label="Dilek ve Talepler" href="/requests" active={isActive("/requests")} />

                    {/* Logout Button - Red */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors mt-4"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Çıkış Yap</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function NavItem({ icon: Icon, label, active, small, href = "#" }: { icon?: any, label: string, active?: boolean, small?: boolean, href?: string }) {
    return (
        <Link href={href} className={clsx(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
            active ? "bg-[#0099CC]/10 text-[#0099CC] font-bold" : "text-gray-600 hover:bg-gray-50 hover:text-[#0099CC]",
            small && "text-sm py-2 text-gray-500"
        )}>
            {Icon && <Icon className={clsx("w-5 h-5", active ? "text-[#0099CC]" : "text-gray-400 group-hover:text-[#0099CC]")} />}
            <span>{label}</span>
        </Link>
    )
}
