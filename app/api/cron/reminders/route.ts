import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import webpush from "web-push";

// Configure web-push with VAPID keys
webpush.setVapidDetails(
    "mailto:test@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function GET() {
    try {
        const now = new Date();
        // Check for appointments in the next 30-40 minutes
        const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
        const fortyMinutesFromNow = new Date(now.getTime() + 40 * 60 * 1000);

        const upcomingAppointments = await prismadb.appointment.findMany({
            where: {
                date: {
                    gte: thirtyMinutesFromNow,
                    lt: fortyMinutesFromNow,
                },
                status: "SCHEDULED",
                reminderSent: false,
            },
            include: {
                client: true,
                user: true, // The dietitian
            },
        });

        console.log(`Found ${upcomingAppointments.length} appointments to remind.`);

        for (const appointment of upcomingAppointments) {
            if (!appointment.userId) continue;

            // Find push subscriptions for the dietitian (user)
            const subscriptions = await prismadb.pushSubscription.findMany({
                where: { userId: appointment.userId },
            });

            const clientName = appointment.client.name;
            const time = appointment.date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
            const message = `Hatırlatma: ${clientName} ile ${time} randevunuz var. Mesaj atmak için tıklayın.`;

            // Construct the WhatsApp URL for the notification action
            const cleanPhone = appointment.client.phone?.replace(/\D/g, '') || "";
            const finalPhone = cleanPhone.startsWith('5') && cleanPhone.length === 10 ? `90${cleanPhone}` : cleanPhone;
            const waMessage = `Sayın ${clientName}, ${time} randevunuzu hatırlatmak isteriz.`;
            const waUrl = finalPhone ? `https://wa.me/${finalPhone}?text=${encodeURIComponent(waMessage)}` : "/appointments";

            const payload = JSON.stringify({
                title: "Randevu Hatırlatması 🕒",
                body: message,
                url: waUrl, // Custom field we'll handle in sw.js
                icon: "/icon.jpg",
            });

            // Send to all subscriptions of the user
            for (const sub of subscriptions) {
                try {
                    await webpush.sendNotification(
                        {
                            endpoint: sub.endpoint,
                            keys: sub.keys as any,
                        },
                        payload
                    );
                } catch (error: any) {
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        // Delete expired subscription
                        await prismadb.pushSubscription.delete({ where: { id: sub.id } });
                    }
                    console.error("Error sending push:", error);
                }
            }

            // Mark as reminder sent
            await prismadb.appointment.update({
                where: { id: appointment.id },
                data: { reminderSent: true },
            });
        }

        return NextResponse.json({ success: true, count: upcomingAppointments.length });
    } catch (error) {
        console.error("Cron error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
