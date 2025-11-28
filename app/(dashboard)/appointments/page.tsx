import prismadb from "@/lib/prismadb";
import { AppointmentCalendar } from "@/components/appointment-calendar";
import dynamic from "next/dynamic";

const CreateAppointmentDialog = dynamic(
    () => import("@/components/create-appointment-dialog").then(mod => ({ default: mod.CreateAppointmentDialog }))
);

export default async function AppointmentsPage() {
    const appointments = await prismadb.appointment.findMany({
        select: {
            id: true,
            date: true,
            status: true,
            notes: true,
            clientId: true,
            serviceId: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
            reminderSent: true,
            client: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    gender: true,
                    birthDate: true,
                    height: true,
                    weight: true,
                    notes: true,
                    createdAt: true,
                    updatedAt: true
                }
            },
            service: {
                select: {
                    id: true,
                    type: true,
                    clientId: true,
                    totalSessions: true,
                    remainingSessions: true,
                    totalPrice: true,
                    status: true,
                    createdAt: true
                }
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    color: true,
                    role: true,
                    createdAt: true
                }
            },
        },
        orderBy: {
            date: "asc",
        },
    });

    const clients = await prismadb.client.findMany({
        select: {
            id: true,
            name: true,
            services: {
                where: {
                    status: "ACTIVE",
                },
                select: {
                    id: true,
                    type: true,
                    remainingSessions: true
                }
            },
        },
        orderBy: {
            name: "asc",
        },
    });

    const users = await prismadb.user.findMany({
        where: {
            username: {
                not: "admin",
            },
        },
        orderBy: {
            name: "asc",
        },
    });

    return (
        <div className="p-0 md:p-8 space-y-4 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-0">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-heading">Randevu Takvimi</h2>
                    <p className="text-text-muted text-sm md:text-base">Randevuları görüntüle ve yönet.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="text-text-muted text-sm md:text-base" suppressHydrationWarning>
                        {new Intl.DateTimeFormat('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            weekday: 'long',
                            timeZone: 'Europe/Istanbul'
                        }).format(new Date())}
                    </div>
                    <CreateAppointmentDialog clients={clients} users={users} />
                </div>
            </div>

            <AppointmentCalendar appointments={appointments} />
        </div>
    );
}
