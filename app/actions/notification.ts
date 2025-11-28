"use server";

import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import { sendPushNotification } from "@/app/actions/push";

export async function createNotification(
    userId: number,
    title: string,
    message: string,
    type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO",
    link?: string
) {
    try {
        await prismadb.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link,
            },
        });

        // Send Push Notification
        await sendPushNotification(userId, title, message, link || "/");
    } catch (error) {
        console.error("Failed to create notification:", error);
    }
}

async function checkUpcomingAppointments(userId: number) {
    const now = new Date();
    const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000);

    const upcomingAppointments = await prismadb.appointment.findMany({
        where: {
            userId,
            date: {
                gte: now,
                lte: thirtyMinutesLater,
            },
            status: "SCHEDULED",
            reminderSent: false,
        },
        include: {
            client: true,
        },
    });

    for (const appointment of upcomingAppointments) {
        await createNotification(
            userId,
            "Randevu Hatırlatması",
            `${appointment.client.name} ile randevunuz 30 dakika içinde başlayacak (${appointment.date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}).`,
            "INFO",
            "/appointments"
        );

        await prismadb.appointment.update({
            where: { id: appointment.id },
            data: { reminderSent: true },
        });
    }
}

export async function getNotifications() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const userId = parseInt(session.user.id);

    // Check for upcoming appointments before fetching notifications
    try {
        await checkUpcomingAppointments(userId);
    } catch (error) {
        console.error("Failed to check upcoming appointments:", error);
    }

    try {
        return await prismadb.notification.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 20,
        });
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return [];
    }
}

export async function getUnreadCount() {
    const session = await auth();
    if (!session?.user?.id) return 0;

    const userId = parseInt(session.user.id);

    try {
        return await prismadb.notification.count({
            where: {
                userId,
                read: false,
            },
        });
    } catch (error) {
        return 0;
    }
}

export async function markAsRead(id: number) {
    const session = await auth();
    if (!session?.user?.id) return;

    const userId = parseInt(session.user.id);

    try {
        await prismadb.notification.update({
            where: {
                id,
                userId, // Ensure ownership
            },
            data: {
                read: true,
            },
        });
        revalidatePath("/");
    } catch (error) {
        console.error("Failed to mark notification as read:", error);
    }
}

export async function markAllAsRead() {
    const session = await auth();
    if (!session?.user?.id) return;

    const userId = parseInt(session.user.id);

    try {
        await prismadb.notification.updateMany({
            where: {
                userId,
                read: false,
            },
            data: {
                read: true,
            },
        });
        revalidatePath("/");
    } catch (error) {
        console.error("Failed to mark all notifications as read:", error);
    }
}
