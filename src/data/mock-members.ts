export interface Member {
    id: string;
    full_name: string;
    avatar_url: string;
    company_name: string;
    position: string;
    email: string;
    phone?: string;
    websites: string[];
    sector: string;
    education: {
        school: string;
        department: string;
        year: string;
    }[];
    languages: string[];
    other_memberships: string;
    birth_date: string;
    marital_status: 'married' | 'single';
    member_type: 'active' | 'honorary' | 'founder' | 'high_advisory' | 'past_president';
    membership_date: string;
    membership_end_date?: string;
    board_role: 'none' | 'president' | 'executive_board' | 'board_member' | 'board_reserve' | 'audit_board';
    committee_work?: string;
    gyiad_projects?: string;
    linkedin_url?: string;
    social?: {
        twitter: string;
        instagram: string;
    };
}

export const mockMembers: Member[] = [
    {
        id: '1',
        full_name: 'Ahmet Yılmaz',
        email: 'ahmet.yilmaz@yilmazholding.com',
        phone: '+90 532 123 45 67',
        company_name: 'Yılmaz Holding',
        sector: 'İnşaat',
        position: 'Yönetim Kurulu Başkanı',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
        member_type: 'active',
        board_role: 'president',
        websites: ['www.yilmazholding.com'],
        linkedin_url: 'https://linkedin.com/in/ahmetyilmaz',
        education: [
            { school: 'İstanbul Teknik Üniversitesi', department: 'İnşaat Mühendisliği', year: '1998' },
            { school: 'Boğaziçi Üniversitesi', department: 'MBA', year: '2005' }
        ],
        languages: ['İngilizce', 'Almanca'],
        birth_date: '1975-04-12',
        marital_status: 'married',
        other_memberships: 'TÜSİAD, MÜSİAD',
        membership_date: '2010-05-20',
        membership_end_date: '-',
        gyiad_projects: "Girişimcilik Komitesi Başkanlığı (2015-2017) döneminde genç girişimcilere yönelik mentorluk programını başlattı. Ayrıca Anadolu'ya açılım toplantılarında aktif rol aldı ve üniversite işbirliklerini güçlendirdi."
    },
    {
        id: '2',
        full_name: 'Ayşe Demir',
        email: 'ayse@techsolutions.com',
        company_name: 'Tech Solutions',
        sector: 'Teknoloji',
        position: 'CEO',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        member_type: 'active',
        board_role: 'board_member',
        websites: ['www.techsolutions.com', 'blog.aysedemir.com'],
        linkedin_url: 'https://linkedin.com/in/aysedemir',
        education: [
            { school: 'ODTÜ', department: 'Bilgisayar Mühendisliği', year: '2012' }
        ],
        languages: ['İngilizce', 'İspanyolca'],
        birth_date: '1990-08-23',
        marital_status: 'single',
        other_memberships: 'KAGİDER',
        membership_date: '2018-11-15',
        gyiad_projects: 'Dijitalleşme Çalışma Grubu'
    },
    {
        id: '3',
        full_name: 'Mehmet Öz',
        email: 'mehmet@ozlojistik.com',
        company_name: 'Öz Lojistik',
        sector: 'Lojistik',
        position: 'Genel Müdür',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
        member_type: 'founder',
        board_role: 'none',
        websites: ['www.ozlojistik.com'],
        linkedin_url: 'https://linkedin.com/in/mehmetoz',
        education: [
            { school: 'Dokuz Eylül Üniversitesi', department: 'Lojistik Yönetimi', year: '2000' }
        ],
        languages: ['İngilizce'],
        birth_date: '1978-01-30',
        marital_status: 'married',
        other_memberships: 'UND',
        membership_date: '2005-01-01',
        gyiad_projects: 'Kurucu Üye'
    },
    {
        id: '4',
        full_name: 'Zeynep Kaya',
        email: 'zeynep@kayagiyim.com',
        company_name: 'Kaya Giyim',
        sector: 'Tekstil',
        position: 'Tasarım Direktörü',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
        member_type: 'active',
        board_role: 'none',
        websites: ['www.kayagiyim.com'],
        linkedin_url: 'https://linkedin.com/in/zeynepkaya',
        education: [
            { school: 'Mimar Sinan Güzel Sanatlar', department: 'Moda Tasarımı', year: '2015' }
        ],
        languages: ['İngilizce', 'İtalyanca', 'Fransızca'],
        birth_date: '1992-06-14',
        marital_status: 'single',
        other_memberships: 'İTG',
        membership_date: '2020-02-10',
        gyiad_projects: 'Sanat ve Kültür Komitesi'
    },
    {
        id: '5',
        full_name: 'Can Vural',
        email: 'can@vuralenerji.com',
        company_name: 'Vural Enerji',
        sector: 'Enerji',
        position: 'Yönetim Kurulu Üyesi',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        member_type: 'active',
        board_role: 'executive_board',
        websites: ['www.vuralenerji.com'],
        linkedin_url: 'https://linkedin.com/in/canvural',
        education: [
            { school: 'Koç Üniversitesi', department: 'Makine Mühendisliği', year: '2010' },
            { school: 'Stanford University', department: 'Energy Systems (MSc)', year: '2012' }
        ],
        languages: ['İngilizce'],
        birth_date: '1988-11-05',
        marital_status: 'married',
        other_memberships: 'DEİK',
        membership_date: '2016-09-01',
        gyiad_projects: 'Sürdürülebilirlik Projeleri'
    },
];
