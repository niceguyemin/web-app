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
import { NotificationBell } from "@/components/notification-bell";

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
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-background-dark border-r border-white/5">
            <div className="px-3 py-2 flex-1">
                <Link href="/" className="flex items-center justify-center mb-6 pt-2">
                    <div className="relative h-12 w-12 shadow-[0_0_15px_rgba(6,182,212,0.5)] rounded-xl overflow-hidden transition-transform hover:scale-110 duration-500 hover:shadow-[0_0_25px_rgba(6,182,212,0.8)] ring-1 ring-white/10 group-hover:ring-primary/50">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <img src="/logo.jpg" alt="Logo" className="object-cover w-full h-full relative z-10" />
                    </div>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => {
                        if (route.href === "/settings" && (session?.user as any)?.role !== "ADMIN") {
                            return (
                                <ProfileDialog key={route.href}>
                                    <div
                                        className={cn(
                                            "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-button transition-all duration-200 text-text-muted hover:text-text-base hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex items-center flex-1">
                                            <route.icon className={cn("h-5 w-5 mr-3 transition-colors", route.color)} />
                                            Profilim
                                        </div>
                                    </div>
                                </ProfileDialog>
                            );
                        }

                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-button transition-all duration-200",
                                    pathname === route.href
                                        ? "bg-white/5 text-primary border border-primary/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                                        : "text-text-muted hover:text-text-base hover:bg-white/5"
                                )}
                            >
                                <div className="flex items-center flex-1">
                                    <route.icon className={cn("h-5 w-5 mr-3 transition-colors", pathname === route.href ? "text-primary" : route.color)} />
                                    {route.label}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
            <div className="px-3 py-2">
                <div className="flex items-center gap-2 mb-4 px-3">
                    <ProfileDialog>
                        <div className="flex-1 p-3 rounded-card bg-background-card border border-white/5 cursor-pointer hover:bg-white/5 transition-colors group">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-text-muted font-medium uppercase group-hover:text-text-base transition-colors">Giriş Yapıldı</p>
                                <Settings className="w-3 h-3 text-text-muted group-hover:text-text-base transition-colors" />
                            </div>
                            <p className="text-sm text-text-base font-medium truncate">{session?.user?.name}</p>
                        </div>
                    </ProfileDialog>
                    <NotificationBell />
                </div>
                <Button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    variant="ghost"
                    className="w-full justify-start text-text-muted hover:text-error hover:bg-error/10 rounded-button"
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    {isLoggingOut ? "Çıkılıyor..." : "Çıkış Yap"}
                </Button>
            </div>
        </div>
    );
}
