"use client";

import { useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
} from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Appointment, Client, Service, User as PrismaUser } from "@prisma/client";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cancelAppointment } from "@/app/actions/appointment";
import { Trash2 } from "lucide-react";

interface AppointmentCalendarProps {
    appointments: (Appointment & {
        client: Client;
        service: Service | null;
        user: PrismaUser | null;
    })[];
}

export function AppointmentCalendar({ appointments }: AppointmentCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const firstDayOfMonth = startOfMonth(currentMonth);
    const lastDayOfMonth = endOfMonth(currentMonth);
    const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => setCurrentMonth(new Date());

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white capitalize">
                        {format(currentMonth, "MMMM yyyy", { locale: tr })}
                    </h2>
                    <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={prevMonth}
                            className="h-7 w-7 text-white hover:bg-white/10"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={goToToday}
                            className="h-7 px-2 text-xs text-white hover:bg-white/10"
                        >
                            Bugün
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={nextMonth}
                            className="h-7 w-7 text-white hover:bg-white/10"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="glass-panel rounded-xl overflow-hidden border border-white/10">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
                    {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
                        <div
                            key={day}
                            className="p-4 text-center text-sm font-medium text-white/70"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 auto-rows-fr">
                    {days.map((day, dayIdx) => {
                        const dayAppointments = appointments.filter((appt) =>
                            isSameDay(new Date(appt.date), day)
                        );

                        return (
                            <div
                                key={day.toString()}
                                className={cn(
                                    "min-h-[120px] p-2 border-b border-r border-white/10 transition-colors hover:bg-white/5 flex flex-col gap-1",
                                    !isSameMonth(day, firstDayOfMonth) && "bg-black/20 text-white/30",
                                    isToday(day) && "bg-primary/5"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span
                                        className={cn(
                                            "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                                            isToday(day)
                                                ? "bg-primary text-white"
                                                : "text-white/70"
                                        )}
                                    >
                                        {format(day, "d")}
                                    </span>
                                </div>

                                <div className="flex-1 flex flex-col gap-1 mt-1 overflow-y-auto max-h-[100px] no-scrollbar">
                                    {dayAppointments.map((appt) => {
                                        const userColor = appt.user?.color || "#3B82F6"; // Default blue if no user/color

                                        return (
                                            <Popover key={appt.id}>
                                                <PopoverTrigger asChild>
                                                    <div
                                                        className={cn(
                                                            "text-xs p-1.5 rounded border text-white cursor-pointer truncate flex items-center gap-1 transition-all",
                                                            appt.status === "CANCELLED"
                                                                ? "bg-red-500/10 border-red-500/20 opacity-50"
                                                                : "border-white/10 hover:brightness-110"
                                                        )}
                                                        style={appt.status !== "CANCELLED" ? {
                                                            backgroundColor: `${userColor}33`, // 20% opacity
                                                            borderColor: `${userColor}4D` // 30% opacity
                                                        } : undefined}
                                                    >
                                                        <div
                                                            className={cn(
                                                                "w-1 h-1 rounded-full shrink-0",
                                                                appt.status === "CANCELLED" ? "bg-red-500" : ""
                                                            )}
                                                            style={appt.status !== "CANCELLED" ? { backgroundColor: userColor } : undefined}
                                                        />
                                                        <span className="opacity-70">
                                                            {format(new Date(appt.date), "HH:mm")}
                                                        </span>
                                                        <span className="font-medium truncate">
                                                            {appt.client.name}
                                                        </span>
                                                        {appt.status === "CANCELLED" && (
                                                            <span className="text-[10px] text-red-400 ml-auto">(İptal)</span>
                                                        )}
                                                    </div>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80 bg-[#0f1021] border border-white/20 text-white p-4 shadow-2xl z-[100]">
                                                    <div className="flex flex-col space-y-4">
                                                        <div className="space-y-1">
                                                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                                                <User className="h-4 w-4" style={{ color: userColor }} />
                                                                {appt.client.name}
                                                            </h4>
                                                            {appt.user && (
                                                                <p className="text-xs text-white/50 flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: userColor }} />
                                                                    Uzman: {appt.user.name || appt.user.username}
                                                                </p>
                                                            )}
                                                            <p className="text-sm text-white/70 flex items-center gap-2">
                                                                <Clock className="h-3 w-3" />
                                                                {format(new Date(appt.date), "d MMMM yyyy HH:mm", {
                                                                    locale: tr,
                                                                })}
                                                            </p>
                                                            {appt.service && (
                                                                <Badge variant="outline" className="border-white/20 text-white/70 mt-2">
                                                                    {appt.service.type}
                                                                </Badge>
                                                            )}
                                                            {appt.notes && (
                                                                <p className="text-xs text-white/50 mt-2 bg-black/20 p-2 rounded">
                                                                    {appt.notes}
                                                                </p>
                                                            )}
                                                            {appt.status === "CANCELLED" && (
                                                                <p className="text-xs text-red-400 mt-2 font-medium">
                                                                    Bu randevu iptal edilmiştir.
                                                                </p>
                                                            )}
                                                        </div>

                                                        {appt.status !== "CANCELLED" && (
                                                            <form action={async () => {
                                                                await cancelAppointment(appt.id);
                                                            }}>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Randevuyu İptal Et
                                                                </Button>
                                                            </form>
                                                        )}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
