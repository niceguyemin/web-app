"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Info, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/app/actions/notification";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    read: boolean;
    link: string | null;
    createdAt: Date;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const fetchNotifications = async () => {
        const [data, count] = await Promise.all([
            getNotifications(),
            getUnreadCount()
        ]);
        setNotifications(data as Notification[]);
        setUnreadCount(count);
    };

    const previousUnreadCount = useRef(0);

    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (unreadCount > previousUnreadCount.current && unreadCount > 0) {
            if ("Notification" in window && Notification.permission === "granted") {
                // Find the latest unread notification
                const latestNotification = notifications.find(n => !n.read);

                new Notification(latestNotification?.title || "Yeni Bildirim", {
                    body: latestNotification?.message || "Okunmamış bildirimleriniz var.",
                    icon: "/logo.jpg"
                });
            }
        }
        previousUnreadCount.current = unreadCount;
    }, [unreadCount, notifications]);

    const handleMarkAsRead = async (id: number) => {
        await markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read) {
            await handleMarkAsRead(notification.id);
        }
        if (notification.link) {
            setIsOpen(false);
            router.push(notification.link);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "SUCCESS": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case "WARNING": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case "ERROR": return <XCircle className="h-4 w-4 text-red-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) fetchNotifications();
        }}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0f172a]" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-[#1e293b] border-white/10 text-white" align="end">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h4 className="font-medium text-sm">Bildirimler</h4>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-1 text-xs text-white/50 hover:text-white hover:bg-white/5"
                            onClick={fetchNotifications}
                        >
                            Yenile
                        </Button>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto px-2 py-1 text-xs text-white/50 hover:text-white hover:bg-white/5"
                                onClick={handleMarkAllAsRead}
                            >
                                <Check className="h-3 w-3 mr-1" />
                                Tümünü okundu işaretle
                            </Button>
                        )}
                    </div>
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-white/50">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">Henüz bildiriminiz yok</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 hover:bg-white/5 transition-colors cursor-pointer",
                                        !notification.read && "bg-white/[0.02]"
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-1 flex-shrink-0">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <p className={cn("text-sm font-medium leading-none", !notification.read ? "text-white" : "text-white/70")}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-white/50 leading-relaxed">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-white/30">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: tr })}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
