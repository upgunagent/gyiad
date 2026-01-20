import Image from 'next/image';
import Link from 'next/link';

interface MemberCardProps {
    id: string;
    name: string;
    company: string;
    avatarUrl: string;
    role?: string;
    cardRole?: string; // Explicitly passed card role
    filter?: string;
}

export default function MemberCard({ id, name, company, avatarUrl, role, cardRole, filter }: MemberCardProps) {
    // Priority: cardRole > role (which is usually computed)
    const displayRole = cardRole || role;
    return (
        <Link href={`/members/${id}${filter ? `?filter=${filter}` : ''}`} className="group block h-full">
            <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col items-center text-center h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-gyiad-blue/30 relative overflow-hidden">

                {/* Subtle Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gyiad-blue to-gyiad-red opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Avatar */}
                <div className="w-52 h-52 rounded-full overflow-hidden border-4 border-gray-50 bg-gray-100 mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300 relative">
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt={name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300">
                            {name.charAt(0)}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-gyiad-blue transition-colors line-clamp-1" title={name}>
                        {name}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 line-clamp-2 min-h-[2.5rem]" title={company}>
                        {company}
                    </p>

                    {displayRole && (
                        <span className="inline-block mt-3 px-2 py-0.5 rounded-full bg-blue-50 text-gyiad-blue text-[10px] font-bold uppercase tracking-wide">
                            {displayRole}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
