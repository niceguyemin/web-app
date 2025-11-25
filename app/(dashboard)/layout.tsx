import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Session check is handled by middleware

    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900/50 backdrop-blur-xl border-r border-white/10">
                <Sidebar />
            </div>
            <div className="md:pl-72 h-full">
                <MobileNav />
                <main className="h-full p-4 pt-24 md:p-8 md:pt-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
