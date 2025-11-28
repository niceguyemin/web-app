"use client";

import Link from "next/link";
import { NotificationBell } from "@/components/notification-bell";
import { ProfileDialog } from "@/components/profile-dialog";
import { User, LogOut } from "lucide-react";
import { useSession } from "next-auth/react";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function MobileHeader() {
    const { data: session } = useSession();

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 h-16 px-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
                <div className="relative h-8 w-8 rounded-lg overflow-hidden ring-1 ring-white/10">
                    <img src="/logo.jpg" alt="Logo" className="object-cover w-full h-full" />
                </div>
                <span className="font-semibold text-white">DanışanTakip</span>
            </Link>

            <div className="flex items-center gap-2">
                <NotificationBell />

                <ProfileDialog>
                    <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
                        <User className="w-5 h-5 text-white/70" />
                    </button>
                </ProfileDialog>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-white/70 hover:text-red-400 hover:bg-red-400/10"
                >
                    <LogOut className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
