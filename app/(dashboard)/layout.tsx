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
        <div className="h-full flex overflow-hidden">
            {/* Desktop sidebar */}
            <div className="hidden md:flex w-64 flex-col border-r border-white/5 bg-white/5 backdrop-blur-sm">
                <Sidebar />
            </div>

            {/* Mobile Sidebar (ResponsiveSidebar needs update too, but let's handle main layout first) */}
            <div className="md:hidden absolute z-50">
                <ResponsiveSidebar />
            </div>

            <main className="flex-1 overflow-y-auto p-6 relative">
                {children}
            </main>
        </div>
    );
}
