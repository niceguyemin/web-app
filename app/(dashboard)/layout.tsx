import { redirect } from "next/navigation";
import ResponsiveSidebar from "@/components/ResponsiveSidebar";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
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
                <div className="md:hidden sticky top-0 z-50 bg-gray-900/50 backdrop-blur-xl border-b border-white/10 p-4">
                    <ResponsiveSidebar />
                </div>
                <main className="h-full p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
