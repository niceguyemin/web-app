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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { signOut } from "@/app/actions/auth";

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
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mr-3 shadow-lg shadow-primary/20">
                        <span className="font-bold text-white text-lg">A</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white">
                        Antigravity
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
                <div className="mx-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-xs text-white/40 font-medium uppercase mb-1">Giriş Yapıldı</p>
                    <p className="text-sm text-white font-medium truncate">{session?.user?.name}</p>
                </div>
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
