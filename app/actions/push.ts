"use server";

import webpush from "web-push";
import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";

// Only set VAPID details if keys are available
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || "mailto:admin@example.com",
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function subscribeUser(sub: PushSubscription) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("User not authenticated");
    }

    // Check if VAPID keys are configured
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        console.warn("Push notifications not configured - VAPID keys missing");
        return { success: false, error: "Push notifications not configured" };
    }

    const userId = parseInt(session.user.id);

    // Check if subscription already exists
    const existingSub = await prismadb.pushSubscription.findFirst({
        where: {
            endpoint: sub.endpoint,
            userId: userId
        }
    });

    if (existingSub) {
        return { success: true };
    }

    await prismadb.pushSubscription.create({
        data: {
            userId: userId,
            endpoint: sub.endpoint,
            keys: sub.toJSON().keys as any,
        },
    });

    return { success: true };
}

export async function sendPushNotification(userId: number, title: string, body: string, url: string = "/") {
    // Check if VAPID keys are configured
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        console.warn("Push notifications not configured - VAPID keys missing");
        return;
    }

    try {
        const subscriptions = await prismadb.pushSubscription.findMany({
            where: { userId },
        });

        const payload = JSON.stringify({ title, body, url });

        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
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
                        // Subscription is no longer valid, delete it
                        await prismadb.pushSubscription.delete({
                            where: { id: sub.id },
                        });
                    }
                    throw error;
                }
            })
        );

        // Log failures if needed, but don't throw to prevent blocking the main flow
        results.forEach((result) => {
            if (result.status === 'rejected') {
                console.error('Push notification failed:', result.reason);
            }
        });

    } catch (error) {
        console.error("Error sending push notification:", error);
    }
}
