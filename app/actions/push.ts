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



export async function subscribeUser(sub: any) {
    console.log("[subscribeUser] Starting subscription process");
    const session = await auth();
    if (!session?.user?.id) {
        console.error("[subscribeUser] User not authenticated");
        throw new Error("User not authenticated");
    }

    console.log("[subscribeUser] User authenticated:", session.user.id);

    // Check if VAPID keys are configured
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        console.warn("[subscribeUser] Push notifications not configured - VAPID keys missing");
        return { success: false, error: "Push notifications not configured" };
    }

    console.log("[subscribeUser] VAPID keys configured");

    const userId = parseInt(session.user.id);

    // Check if subscription already exists
    const existingSub = await prismadb.pushSubscription.findFirst({
        where: {
            endpoint: sub.endpoint,
            userId: userId
        }
    });

    if (existingSub) {
        console.log("[subscribeUser] Subscription already exists");
        return { success: true };
    }

    console.log("[subscribeUser] Creating new subscription");
    await prismadb.pushSubscription.create({
        data: {
            userId: userId,
            endpoint: sub.endpoint,
            keys: sub.keys as any,
        },
    });

    console.log("[subscribeUser] Subscription created successfully");
    return { success: true };
}

export async function sendPushNotification(userId: number, title: string, body: string, url: string = "/") {
    console.log("[sendPushNotification] Starting for userId:", userId, "title:", title);

    // Check if VAPID keys are configured
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        console.warn("[sendPushNotification] Push notifications not configured - VAPID keys missing");
        return;
    }

    console.log("[sendPushNotification] VAPID keys configured");

    try {
        const subscriptions = await prismadb.pushSubscription.findMany({
            where: { userId },
        });

        console.log("[sendPushNotification] Found", subscriptions.length, "subscriptions");

        if (subscriptions.length === 0) {
            console.warn("[sendPushNotification] No subscriptions found for user", userId);
            return;
        }

        const payload = JSON.stringify({ title, body, url });
        console.log("[sendPushNotification] Payload:", payload);

        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                try {
                    console.log("[sendPushNotification] Sending to endpoint:", sub.endpoint.substring(0, 50) + "...");
                    await webpush.sendNotification(
                        {
                            endpoint: sub.endpoint,
                            keys: sub.keys as any,
                        },
                        payload
                    );
                    console.log("[sendPushNotification] Successfully sent to endpoint");
                } catch (error: any) {
                    console.error("[sendPushNotification] Error sending to endpoint:", error.message);
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        // Subscription is no longer valid, delete it
                        console.log("[sendPushNotification] Deleting invalid subscription");
                        await prismadb.pushSubscription.delete({
                            where: { id: sub.id },
                        });
                    }
                    throw error;
                }
            })
        );

        // Log failures if needed, but don't throw to prevent blocking the main flow
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error('[sendPushNotification] Push notification failed for subscription', index, ':', result.reason);
            } else {
                console.log('[sendPushNotification] Push notification succeeded for subscription', index);
            }
        });

    } catch (error) {
        console.error("[sendPushNotification] Error sending push notification:", error);
    }
}
