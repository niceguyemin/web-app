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
    Calendar,
} from "lucide-react";
import { useSession } from "next-auth/react";

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

export function MobileNav() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
            <div className="glass-panel rounded-full border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
                <div className="flex items-center justify-around p-2">
                    {routes.map((route) => {
                        if (route.href === "/settings" && (session?.user as any)?.role !== "ADMIN") {
                            return null;
                        }

                        const isActive = pathname === route.href;

                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full py-2 transition-all duration-200 group relative",
                                    isActive ? "text-primary" : "text-zinc-400 hover:text-zinc-200"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-white/5 rounded-full -z-10 scale-90" />
                                )}
                                <route.icon
                                    className={cn(
                                        "h-6 w-6 transition-all duration-300",
                                        isActive && "scale-110"
                                    )}
                                    strokeWidth={isActive ? 2.5 : 1.5}
                                />
                                <span className={cn(
                                    "text-[9px] font-medium mt-0.5 transition-all duration-200",
                                    isActive ? "font-semibold" : "font-medium"
                                )}>
                                    {route.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
