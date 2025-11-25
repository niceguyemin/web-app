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
            <ResponsiveSidebar />
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <Sidebar />
            </div>
            <main className="md:pl-72 h-full bg-gray-50">
                {children}
            </main>
        </div>
    );
}
