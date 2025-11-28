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
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-white/10 pb-safe">
            <div className="flex items-center justify-around p-2">
                {routes.map((route) => {
                    if (route.href === "/settings" && (session?.user as any)?.role !== "ADMIN") {
                        return null; // Settings is handled in header for non-admins or just hidden here
                    }

                    const isActive = pathname === route.href;

                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full py-2 px-1 rounded-xl transition-all duration-200",
                                isActive
                                    ? "text-primary bg-primary/10"
                                    : "text-white/50 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <route.icon className={cn("h-6 w-6 mb-1", isActive ? "text-primary" : "text-current")} />
                            <span className="text-[10px] font-medium">{route.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
