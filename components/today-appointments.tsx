import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";

interface TodayAppointmentsProps {
    appointments: {
        id: number;
        date: Date;
        client: {
            id: number;
            name: string;
        };
        service: {
            type: string;
        } | null;
        user: {
            name: string | null;
            username: string;
            color: string | null;
        } | null;
        status: string;
    }[];
}

export function TodayAppointments({ appointments }: TodayAppointmentsProps) {
    return (
        <div className="space-y-8">
            {appointments.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">
                    Bugün için planlanmış randevu bulunmuyor.
                </p>
            ) : (
                appointments.map((appt) => (
                    <div key={appt.id} className="flex items-center">
                        <Avatar className="h-9 w-9 border border-white/10">
                            <AvatarFallback
                                className="font-medium text-text-heading"
                                style={{ backgroundColor: appt.user?.color || "#3B82F6" }}
                            >
                                {appt.client.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                                <Link href={`/clients/${appt.client.id}?tab=profile`} className="text-sm font-medium leading-none text-text-heading hover:text-primary transition-colors">
                                    {appt.client.name}
                                </Link>
                                <span className="text-sm font-bold text-text-heading">
                                    {format(new Date(appt.date), "HH:mm")}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-text-muted">
                                    {appt.service?.type || "Hizmet Yok"}
                                </p>
                                {appt.user && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-text-muted">
                                        {appt.user.name || appt.user.username}
                                    </span>
                                )}
                            </div>
                        </div>
                        {appt.status === "CANCELLED" && (
                            <Badge variant="destructive" className="ml-2 text-[10px] h-5">İptal</Badge>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
