"use client";

import { useState, useEffect } from "react";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cancelAppointment } from "@/app/actions/appointment";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface AppointmentCalendarProps {
    appointments: (Appointment & {
        client: Client;
        service: Service | null;
        user: PrismaUser | null;
    })[];
}

export function AppointmentCalendar({ appointments }: AppointmentCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);

    useEffect(() => {
        setCurrentMonth(new Date());
    }, []);

    if (!currentMonth) {
        return null; // Or a loading skeleton
    }

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
                    <h2 className="text-2xl font-bold text-text-heading capitalize">
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
            <div className="card rounded-xl overflow-hidden border border-white/10 overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 border-b border-white/10">
                        {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
                            <div
                                key={day}
                                className="p-4 text-center text-sm font-medium text-text-muted"
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
                                    onClick={() => setSelectedDay(day)}
                                    className={cn(
                                        "min-h-[120px] p-2 border-b border-r border-white/10 transition-colors flex flex-col gap-1 cursor-pointer hover:bg-white/5",
                                        !isSameMonth(day, firstDayOfMonth) && "bg-black/20 text-text-muted/50",
                                        isToday(day) && "bg-primary/5"
                                    )}
                                >
                                    <div className="flex justify-between items-start">
                                        <span
                                            className={cn(
                                                "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                                                isToday(day)
                                                    ? "bg-primary text-white"
                                                    : "text-text-muted"
                                            )}
                                        >
                                            {format(day, "d")}
                                        </span>
                                    </div>

                                    <div className="flex-1 flex flex-col gap-1 mt-1 overflow-y-auto max-h-[100px] no-scrollbar">
                                        {dayAppointments.map((appt) => {
                                            const userColor = appt.user?.color || "#3B82F6"; // Default blue if no user/color

                                            return (
                                                <div
                                                    key={appt.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent opening day view when clicking appointment
                                                    }}
                                                >
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <div
                                                                className={cn(
                                                                    "text-xs p-1.5 rounded border text-white cursor-pointer truncate flex items-center gap-1 transition-all",
                                                                    appt.status === "CANCELLED"
                                                                        ? "bg-error/10 border-error/20 opacity-50"
                                                                        : "border-white/10 hover:border-primary hover:shadow-[0_0_15px_rgba(37,99,235,0.6)] hover:bg-primary/20 hover:scale-[1.02] hover:z-10"
                                                                )}
                                                                style={appt.status !== "CANCELLED" ? {
                                                                    backgroundColor: `${userColor}33`, // 20% opacity
                                                                    borderColor: `${userColor}4D` // 30% opacity
                                                                } : undefined}
                                                            >
                                                                <div
                                                                    className={cn(
                                                                        "w-1 h-1 rounded-full shrink-0",
                                                                        appt.status === "CANCELLED" ? "bg-error" : ""
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
                                                                    <span className="text-[10px] text-error ml-auto">(İptal)</span>
                                                                )}
                                                            </div>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-80 bg-black/80 backdrop-blur-xl border border-white/20 text-white p-4 shadow-2xl z-[100]">
                                                            <div className="flex flex-col space-y-4">
                                                                <div className="space-y-1">
                                                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                                                        <User className="h-4 w-4" style={{ color: userColor }} />
                                                                        <Link href={`/clients/${appt.client.id}?tab=profile`} className="hover:underline">
                                                                            {appt.client.name}
                                                                        </Link>
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
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50"
                                                                        onClick={async () => {
                                                                            try {
                                                                                await cancelAppointment(appt.id);
                                                                                toast.success("Randevu iptal edildi");
                                                                            } catch (error) {
                                                                                toast.error("İptal işlemi başarısız");
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Randevuyu İptal Et
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Day View Dialog */}
            <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
                <DialogContent className="bg-black/80 backdrop-blur-xl border border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedDay && format(selectedDay, "d MMMM yyyy", { locale: tr })}
                        </DialogTitle>
                        <DialogDescription className="text-white/50">
                            Bu tarihteki tüm randevular
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                        {selectedDay && appointments.filter(appt => isSameDay(new Date(appt.date), selectedDay)).length === 0 ? (
                            <p className="text-center text-white/50 py-8">Bu tarihte randevu bulunmuyor.</p>
                        ) : (
                            selectedDay && appointments
                                .filter(appt => isSameDay(new Date(appt.date), selectedDay))
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .map((appt) => {
                                    const userColor = appt.user?.color || "#3B82F6";
                                    return (
                                        <div key={appt.id} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: userColor }} />
                                                    <span className="font-medium text-lg">{format(new Date(appt.date), "HH:mm")}</span>
                                                </div>
                                                {appt.status === "CANCELLED" && (
                                                    <Badge variant="destructive" className="h-5 text-[10px]">İptal</Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <Link href={`/clients/${appt.client.id}?tab=profile`} className="font-medium hover:text-primary transition-colors">
                                                    {appt.client.name}
                                                </Link>
                                                {appt.service && (
                                                    <Badge variant="outline" className="border-white/10 text-white/70">
                                                        {appt.service.type}
                                                    </Badge>
                                                )}
                                            </div>

                                            {appt.user && (
                                                <p className="text-xs text-white/50">
                                                    Uzman: {appt.user.name || appt.user.username}
                                                </p>
                                            )}

                                            {appt.notes && (
                                                <p className="text-xs text-white/50 bg-black/20 p-2 rounded">
                                                    {appt.notes}
                                                </p>
                                            )}

                                            {appt.status !== "CANCELLED" && (
                                                <div className="pt-2 flex justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                        onClick={async () => {
                                                            try {
                                                                await cancelAppointment(appt.id);
                                                                toast.success("Randevu iptal edildi");
                                                            } catch (error) {
                                                                toast.error("İptal işlemi başarısız");
                                                            }
                                                        }}
                                                    >
                                                        İptal Et
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
