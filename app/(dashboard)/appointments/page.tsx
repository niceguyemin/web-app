import prismadb from "@/lib/prismadb";
import { AppointmentCalendar } from "@/components/appointment-calendar";
import { CreateAppointmentDialog } from "@/components/create-appointment-dialog";

export default async function AppointmentsPage() {
    const appointments = await prismadb.appointment.findMany({
        include: {
            client: true,
            service: true,
            user: true,
        },
        orderBy: {
            date: "asc",
        },
    });

    const clients = await prismadb.client.findMany({
        include: {
            services: {
                where: {
                    status: "ACTIVE",
                },
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
        <div className="p-4 md:p-8 space-y-4 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Randevu Takvimi</h2>
                    <p className="text-white/50 text-sm md:text-base">Randevuları görüntüle ve yönet.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="text-white/70 text-sm md:text-base" suppressHydrationWarning>
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
