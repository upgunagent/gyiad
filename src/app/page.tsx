'use client';

import { useState, useEffect, Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MemberCard from '@/components/MemberCard';
import { memberService, DbMember } from '@/services/memberService';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <Dashboard />
    </Suspense>
  );
}

function Dashboard() {
  const [allMembers, setAllMembers] = useState<DbMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<DbMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || 'active'; // Default to active members

  useEffect(() => {
    async function loadMembers() {
      setIsLoading(true);
      const members = await memberService.getAllMembers();
      setAllMembers(members || []);
      setIsLoading(false);
    }
    loadMembers();
  }, []);

  useEffect(() => {
    if (!allMembers.length) return;

    // Filter out 'left' members AND 'is_admin' members (Super Admin)
    let result = allMembers.filter(m => m.member_type !== 'left' && !m.is_admin);

    // SECTOR FILTER LOGIC
    const sectorFilter = searchParams.get('sector');
    if (sectorFilter) {
      result = result.filter(m => m.sector === sectorFilter);
    }

    // GENDER FILTER LOGIC
    const genderFilter = searchParams.get('gender');
    if (genderFilter) {
      result = result.filter(m => m.gender === genderFilter);
    }



    // GLOBAL SEARCH LOGIC
    const searchTerm = searchParams.get('search');
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      // If we have a search term, we search EVERYONE (except 'left') matching the name
      // ignoring the current tab/filter category
      result = result.filter(m => m.full_name.toLowerCase().includes(lowerTerm));

      // We stop here to show ALL results across the database (as loaded in allMembers)
      setFilteredMembers(result);
      return;
    }

    // Logic based on User Rules
    // board_roles is an array of strings

    switch (filter) {
      case 'president':
        result = result.filter(m => m.board_roles?.includes('president'));
        break;
      case 'executive':
        // Executive Board: Only explicit 'executive_board' role
        result = result.filter(m => m.board_roles?.includes('executive_board'));
        break;
      case 'board_all': // All Board Members
        result = result.filter(m =>
          m.board_roles?.includes('board_member') ||
          m.board_roles?.includes('board_reserve')
        );
        break;
      case 'board_regular': // Asil
        result = result.filter(m => m.board_roles?.includes('board_member')); // Assuming 'board_member' means Asil
        break;
      case 'board_reserve': // Yedek
        result = result.filter(m => m.board_roles?.includes('board_reserve'));
        break;
      case 'audit_all':
        result = result.filter(m =>
          m.board_roles?.includes('audit_board') ||
          m.board_roles?.includes('audit_reserve')
        );
        break;
      case 'audit_regular':
        result = result.filter(m => m.board_roles?.includes('audit_board'));
        break;
      case 'audit_reserve':
        result = result.filter(m => m.board_roles?.includes('audit_reserve'));
        break;
      case 'active':
        result = result.filter(m => m.member_type === 'active');
        break;
      case 'honorary':
        result = result.filter(m => m.member_type === 'honorary');
        break;
      case 'advisory': // Yüksek İstişare
        result = result.filter(m => m.board_roles?.includes('high_advisory_board'));
        break;
      case 'founders':
        result = result.filter(m => m.board_roles?.includes('founder'));
        break;
      case 'past_presidents':
        result = result.filter(m => m.board_roles?.includes('past_president'));
        break;
      default:
        // Default handling? Maybe show all active?
        // result = result; 
        break;
    }

    setFilteredMembers(result);
  }, [filter, allMembers, searchParams]);

  // Format Page Title
  const getTitle = () => {
    const titles: Record<string, string> = {
      'president': 'BAŞKAN',
      'executive': 'İCRA KURULU',
      'board_all': 'YÖNETİM KURULU',
      'board_regular': 'YÖNETİM KURULU (ASİL)',
      'board_reserve': 'YÖNETİM KURULU (YEDEK)',
      'audit_all': 'DENETLEME KURULU',
      'active': 'AKTİF ÜYELER',
      'honorary': 'FAHRİ ÜYELER',
      'advisory': 'YÜKSEK İSTİŞARE KURULU',
      'founders': 'KURUCU ÜYELER',
      'past_presidents': 'GEÇMİŞ DÖNEM BAŞKANLARI'
    };
    return titles[filter] || 'ÜYELER';
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-72 p-4 md:p-12 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <Header />

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">{getTitle()}</h2>
            <p className="text-sm text-gray-500">Listelenen üye sayısı: {filteredMembers.length}</p>
          </div>

          {isLoading ? (
            <div className="text-center py-10">Yükleniyor...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  id={member.id}
                  name={member.full_name}
                  company={member.company_name}
                  // Primary Role Display Logic
                  role={formatPrimaryRole(member.board_roles, member.member_type)}
                  avatarUrl={member.avatar_url}
                  cardRole={member.card_role}
                />
              ))}
            </div>
          )}

          {!isLoading && filteredMembers.length === 0 && (
            <div className="text-center py-10 text-gray-400">Bu kategoride üye bulunmamaktadır.</div>
          )}
        </div>
      </main>
    </div>
  );
}

function formatPrimaryRole(roles: string[] | undefined, type: string) {
  if (!roles || roles.length === 0) {
    if (type === 'honorary') return 'Fahri Üye';
    if (type === 'founder') return 'Kurucu Üye'; // if exist
    return 'Üye';
  }
  // Hierarchy of display title
  if (roles.includes('president')) return 'Başkan';
  if (roles.includes('vice_president')) return 'Başkan Yardımcısı';
  if (roles.includes('executive_board')) return 'İcra Kurulu Üyesi';
  if (roles.includes('board_member')) return 'Yönetim Kurulu Üyesi';
  if (roles.includes('board_reserve')) return 'YK Yedek Üye';
  if (roles.includes('audit_board')) return 'Denetleme Kurulu Üyesi';
  if (roles.includes('high_advisory_board')) return 'YİK Üyesi';
  if (roles.includes('founder')) return 'Kurucu Üye';
  if (roles.includes('past_president')) return 'Geçmiş Dönem Başkanı';

  return 'Üye';
}
