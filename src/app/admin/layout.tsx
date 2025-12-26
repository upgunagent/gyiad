import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <AdminSidebar />
            <main className="flex-1 ml-0 lg:ml-72 p-4 md:p-8 overflow-y-auto h-screen transition-all duration-300">
                <div className="w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
