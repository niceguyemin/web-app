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
        orderBy: {
            name: "asc",
        },
    });

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Randevu Takvimi</h2>
                    <p className="text-white/50">Randevuları görüntüle ve yönet.</p>
                </div>
                <CreateAppointmentDialog clients={clients} users={users} />
            </div>

            <AppointmentCalendar appointments={appointments} />
        </div>
    );
}
