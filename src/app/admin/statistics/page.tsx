'use client';

import { useState, useEffect, useMemo } from 'react';
import { memberService, DbMember } from '@/services/memberService';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    LabelList
} from 'recharts';
import { Loader2, Users, UserCheck, UserMinus, Award, Briefcase, Star } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function StatCard({ title, value, icon: Icon, color }: any) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        orange: 'bg-orange-50 text-orange-600',
        red: 'bg-red-50 text-red-600',
        cyan: 'bg-cyan-50 text-cyan-600',
    };

    const cardColor = colorClasses[color] || 'bg-gray-50 text-gray-600';

    return (
        <div className={`rounded-lg p-4 shadow-sm flex items-center space-x-4 ${cardColor}`}>
            <div className={`p-3 rounded-full ${cardColor.replace('-50', '-100').replace('-600', '-700')}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
            {children}
        </div>
    );
}

export default function StatisticsPage() {
    const [members, setMembers] = useState<DbMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [movementYear, setMovementYear] = useState<number>(new Date().getFullYear());
    const [statusYear, setStatusYear] = useState<number | string>('current');

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const data = await memberService.getAllMembers();
            // Filter out admin/test users as per other pages
            const realMembers = (data || []).filter(m =>
                m.company_name !== 'GYİAD' &&
                !m.email?.includes('upgunagent') &&
                !m.email?.includes('admin@gyiad')
            );
            setMembers(realMembers);
            setIsLoading(false);
        }
        loadData();
    }, []);

    // --- AGGREGATIONS ---

    // --- AGGREGATIONS ---

    const stats = useMemo(() => {
        if (!members.length) return null;

        const isFounder = (m: DbMember) =>
            m.member_type === 'founder' || (m.board_roles && m.board_roles.includes('founder'));

        const total = members.length;
        // Count as Active if type is active. Do NOT exclude founders, as they can be both active and founder.
        const active = members.filter(m => m.member_type === 'active').length;
        const honorary = members.filter(m => m.member_type === 'honorary').length;
        const founder = members.filter(m => isFounder(m)).length;
        const left = members.filter(m => m.member_type === 'left').length;

        // Gender
        const male = members.filter(m => m.gender === 'male').length;
        const female = members.filter(m => m.gender === 'female').length;
        const genderData = [
            { name: 'Erkek', value: male },
            { name: 'Kadın', value: female }
        ];

        // Marital Status
        const single = members.filter(m => m.marital_status === 'single').length;
        const married = members.filter(m => m.marital_status === 'married').length;
        const maritalData = [
            { name: 'Bekar', value: single },
            { name: 'Evli', value: married }
        ];

        // Sectors (Top 5)
        const sectorCounts: Record<string, number> = {};
        members.forEach(m => {
            if (m.sector) {
                sectorCounts[m.sector] = (sectorCounts[m.sector] || 0) + 1;
            }
        });
        const sectorData = Object.entries(sectorCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // Age Distribution
        const ageBuckets: Record<string, number> = {
            '18-30': 0, '31-40': 0, '41-50': 0, '51-60': 0, '60+': 0
        };
        members.forEach(m => {
            if (m.birth_date) {
                const birthDate = new Date(m.birth_date);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const mMonth = today.getMonth() - birthDate.getMonth();
                if (mMonth < 0 || (mMonth === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                if (age <= 30) ageBuckets['18-30']++;
                else if (age <= 40) ageBuckets['31-40']++;
                else if (age <= 50) ageBuckets['41-50']++;
                else if (age <= 60) ageBuckets['51-60']++;
                else ageBuckets['60+']++;
            }
        });
        const ageData = Object.entries(ageBuckets).map(([name, value]) => ({ name, value }));

        return { total, active, honorary, founder, left, genderData, maritalData, sectorData, ageData };
    }, [members]);

    // --- YEARLY MOVEMENTS ---
    const movementData = useMemo(() => {
        // Members joined in selected year
        const joined = members.filter(m => {
            if (!m.membership_date) return false;
            return new Date(m.membership_date).getFullYear() === movementYear;
        }).length;

        // Members left in selected year
        const leftCount = members.filter(m => {
            if (!m.membership_end_date || m.member_type !== 'left') return false;
            return new Date(m.membership_end_date).getFullYear() === movementYear;
        }).length;

        return [
            { name: 'Yeni Üye', value: joined },
            { name: 'Ayrılan Üye', value: leftCount }
        ];
    }, [members, movementYear]);

    // --- STATUS SNAPSHOT/TRENDS ---
    const statusTrendData = useMemo(() => {
        // Count events in that year
        const isFounder = (m: DbMember) =>
            m.member_type === 'founder' || (m.board_roles && m.board_roles.includes('founder'));

        let activeEvents, honoraryEvents, founderEvents, leftEvents;

        if (statusYear === 'current') {
            // Show TOTALS as they are right now (Active = current active members, etc.)
            // Similar to top cards logic
            activeEvents = members.filter(m => m.member_type === 'active').length;
            honoraryEvents = members.filter(m => m.member_type === 'honorary').length;
            founderEvents = members.filter(m => isFounder(m)).length;
            leftEvents = members.filter(m => m.member_type === 'left').length;
        } else {
            // Show events/changes in that specific year (who joined/became that status in that year)
            // Note: This logic assumes 'membership_date' is the start date for that status.
            /* 
               CRITICAL: The previous logic was:
               activeEvents = members.filter(m => m.member_type === 'active' && new Date(m.membership_date).getFullYear() === statusYear).length;
               
               This actually counted "Active members who JOINED in statusYear". 
               It did NOT show "Total Active Members in statusYear".
               The user asked for "Existing total for all years" when "Güncel" is selected.
               For specific years, I will preserve the existing logic (JOINED/CHANGED in that year) as implied by the previous code,
               or if the user wanted "Total at end of that year", that would be much harder.
               Given the prompt "sadece admin yapabisin. o yüzden admin sayfasındaki kalsın" implies the previous behavior was acceptable for years.
            */
            activeEvents = members.filter(m => m.member_type === 'active' && new Date(m.membership_date).getFullYear() === statusYear).length;
            honoraryEvents = members.filter(m => m.member_type === 'honorary' && new Date(m.membership_date).getFullYear() === statusYear).length;
            founderEvents = members.filter(m => isFounder(m) && new Date(m.membership_date).getFullYear() === statusYear).length;
            leftEvents = members.filter(m => m.member_type === 'left' && m.membership_end_date && new Date(m.membership_end_date).getFullYear() === statusYear).length;
        }

        return [
            { name: 'Aktif Üye', value: activeEvents },
            { name: 'Fahri Üye', value: honoraryEvents },
            { name: 'Kurucu Üye', value: founderEvents },
            { name: 'Ayrılan Üye', value: leftEvents },
        ];
    }, [members, statusYear]);


    if (isLoading) {
        return <div className="flex h-full items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#0099CC]" /></div>;
    }

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 21 }, (_, i) => currentYear - i);

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">İstatistikler</h1>
                <p className="text-gray-500">Üye verileri ve hareket analizi.</p>
            </div>

            {/* 1. KEY METRICS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="Toplam Üye" value={stats?.total || 0} icon={Users} color="blue" />
                <StatCard title="Aktif Üye" value={stats?.active || 0} icon={UserCheck} color="green" />
                <StatCard title="Fahri Üye" value={stats?.honorary || 0} icon={Award} color="orange" />
                <StatCard title="Kurucu Üye" value={stats?.founder || 0} icon={Star} color="cyan" />
                <StatCard title="Ayrılan Üye" value={stats?.left || 0} icon={UserMinus} color="red" />
            </div>

            {/* 2. DISTRIBUTIONS (Row 1) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gender */}
                <ChartCard title="Cinsiyet Dağılımı">
                    <div className="flex flex-col h-full">
                        <div className="flex-1 min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats?.genderData}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats?.genderData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="pb-8 flex justify-center gap-6">
                            {stats?.genderData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-sm font-medium text-gray-700">{entry.name} <span className="text-gray-500">({entry.value} kişi)</span></span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ChartCard>

                {/* Marital Status */}
                <ChartCard title="Medeni Durum Dağılımı">
                    <div className="flex flex-col h-full">
                        <div className="flex-1 min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats?.maritalData}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#82ca9d"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats?.maritalData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="pb-8 flex justify-center gap-6">
                            {stats?.maritalData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }}></div>
                                    <span className="text-sm font-medium text-gray-700">{entry.name} <span className="text-gray-500">({entry.value} kişi)</span></span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ChartCard>
            </div>

            {/* 3. DISTRIBUTIONS (Row 2) - Age & Movement */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Yaş Dağılımı">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats?.ageData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8" name="Kişi Sayısı">
                                <LabelList dataKey="value" position="center" fill="white" formatter={(value: any) => value > 0 ? `${value} kişi` : ''} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Yıllık Üye Hareketleri</h3>
                        <select
                            value={movementYear}
                            onChange={(e) => setMovementYear(Number(e.target.value))}
                            className="p-1 border border-gray-300 rounded text-sm bg-white"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={movementData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#0099CC" name="Kişi Sayısı">
                                    <LabelList dataKey="value" position="center" fill="white" formatter={(value: any) => value > 0 ? `${value} kişi` : ''} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="text-center mt-2 text-xs text-gray-400">
                            {movementYear} verileri
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. SECTOR DISTRIBUTION (Row 3 - Dynamic Height) */}
            <div className="w-full">
                <ChartCard title="Sektör Dağılımı">
                    <div style={{ height: Math.max(300, (stats?.sectorData.length || 0) * 60) }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.sectorData} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#00C49F" name="Kişi Sayısı" barSize={40}>
                                    <LabelList dataKey="value" position="center" fill="white" formatter={(value: any) => value > 0 ? `${value} kişi` : ''} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>

            <hr className="border-gray-200" />



            {/* 5. STATUS TRENDS */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Üyelik Türü İstatistikleri</h2>
                    <select
                        value={statusYear}
                        onChange={(e) => {
                            const val = e.target.value;
                            setStatusYear(val === 'current' ? 'current' : Number(val));
                        }}
                        className="p-2 border border-gray-300 rounded-lg bg-white"
                    >
                        <option value="current">Güncel (Tümü)</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={statusTrendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#FFBB28" name="Kişi Sayısı">
                                <LabelList dataKey="value" position="center" fill="white" formatter={(value: any) => value > 0 ? `${value} kişi` : ''} />
                                {
                                    statusTrendData.map((entry, index) => {
                                        const colors = ['#00C49F', '#FFBB28', '#0099CC', '#EF4444']; // Active, Honorary, Founder, Left
                                        return <Cell key={`cell-${index}`} fill={colors[index] || '#8884d8'} />;
                                    })
                                }
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="text-center mt-4 text-sm text-gray-500">
                        {statusYear === 'current' ? 'Toplam mevcut üye sayıları' : `${statusYear} yılındaki üyelik değişimleri`}
                    </div>
                </div>
            </div>
        </div >
    );
}


