"use client";

import { useEffect } from "react";
import { subscribeUser } from "@/app/actions/push";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function ClientPushManager() {
    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            const registerServiceWorker = async () => {
                try {
                    const registration = await navigator.serviceWorker.register("/sw.js", {
                        scope: "/",
                        updateViaCache: "none",
                    });

                    // Wait for the service worker to be active
                    const serviceWorker = registration.installing || registration.waiting || registration.active;

                    if (serviceWorker) {
                        // If it's already active or waiting, proceed
                        if (serviceWorker.state === 'activated') {
                            await subscribe(registration);
                        }
                        serviceWorker.addEventListener('statechange', async (e: any) => {
                            if (e.target.state === 'activated') {
                                await subscribe(registration);
                            }
                        });
                    } else {
                        await subscribe(registration);
                    }

                } catch (error) {
                    console.error("Service Worker registration failed:", error);
                }
            };

            registerServiceWorker();
        }
    }, []);

    const subscribe = async (registration: ServiceWorkerRegistration) => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                if (!PUBLIC_KEY) {
                    console.error("VAPID Public Key is missing");
                    return;
                }

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY),
                });

                await subscribeUser(JSON.parse(JSON.stringify(subscription)));
            }
        } catch (error) {
            console.error("Failed to subscribe user:", error);
        }
    }

    return null; // This component doesn't render anything visible
}
