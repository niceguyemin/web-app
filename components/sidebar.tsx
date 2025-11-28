"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Calculator,
    Settings,
    LogOut,
    Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { signOut } from "@/app/actions/auth";
import { ProfileDialog } from "@/components/profile-dialog";

const routes = [
    {
        label: "Panel",
        icon: LayoutDashboard,
        href: "/",
        color: "text-sky-500",
    },
    {
        label: "Danışanlar",
        icon: Users,
        href: "/clients",
        color: "text-violet-500",
    },
    {
        label: "Randevular",
        icon: Calendar,
        href: "/appointments",
        color: "text-orange-500",
    },
    {
        label: "Muhasebe",
        icon: Calculator,
        href: "/accounting",
        color: "text-pink-700",
    },
    {
        label: "Ayarlar",
        icon: Settings,
        href: "/settings",
        color: "text-gray-500",
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="space-y-4 py-4 flex flex-col h-full text-white/80">
            <div className="px-3 py-2 flex-1">
                <Link href="/" className="flex items-center pl-3 mb-10">
                    <div className="relative h-10 w-10 mr-3 shadow-lg rounded-xl overflow-hidden">
                        <img src="/logo.png" alt="Logo" className="object-cover w-full h-full" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white">
                        DanışanTakip
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-white/10 rounded-xl transition-all duration-200",
                                pathname === route.href
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-white/60 hover:text-white"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <ProfileDialog>
                    <div className="mx-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors group">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-white/40 font-medium uppercase group-hover:text-white/60 transition-colors">Giriş Yapıldı</p>
                            <Settings className="w-3 h-3 text-white/20 group-hover:text-white/60 transition-colors" />
                        </div>
                        <p className="text-sm text-white font-medium truncate">{session?.user?.name}</p>
                    </div>
                </ProfileDialog>
                <Button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    variant="ghost"
                    className="w-full justify-start text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    {isLoggingOut ? "Çıkılıyor..." : "Çıkış Yap"}
                </Button>
            </div>
        </div>
    );
}
