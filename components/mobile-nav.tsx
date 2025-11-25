"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Calculator,
    Settings,
    LogOut,
} from "lucide-react";
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

export function MobileNav() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                if (window.scrollY > lastScrollY && window.scrollY > 50) {
                    // Scrolling down & past top
                    setIsVisible(false);
                } else {
                    // Scrolling up
                    setIsVisible(true);
                }
                setLastScrollY(window.scrollY);
            }
        };

        window.addEventListener('scroll', controlNavbar);

        return () => {
            window.removeEventListener('scroll', controlNavbar);
        };
    }, [lastScrollY]);

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <div
            className={cn(
                "md:hidden fixed top-0 left-0 right-0 z-[100] transition-transform duration-300 ease-in-out",
                isVisible ? "translate-y-0" : "-translate-y-full"
            )}
        >
            <div className="mx-4 mt-4 p-2 rounded-2xl glass-panel flex items-center justify-between bg-[#1a1b4b]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
                <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar flex-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "p-3 rounded-xl transition-all duration-200 flex flex-col items-center justify-center min-w-[60px]",
                                pathname === route.href
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-white/50 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <route.icon className={cn("h-6 w-6", pathname === route.href ? "text-white" : route.color)} />
                            <span className="text-[10px] mt-1 font-medium">{route.label}</span>
                        </Link>
                    ))}
                </div>

                <div className="h-8 w-[1px] bg-white/10 mx-2" />

                <button
                    onClick={handleLogout}
                    className="p-3 rounded-xl text-white/50 hover:text-red-400 hover:bg-white/5 transition-colors"
                >
                    <LogOut className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
}
