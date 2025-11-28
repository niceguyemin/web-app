"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createNotification } from "@/app/actions/notification";
import { useSession } from "next-auth/react";

export default function PushTestPage() {
    const { data: session } = useSession();
    const [status, setStatus] = useState<string>("Kontrol ediliyor...");
    const [subscription, setSubscription] = useState<any>(null);
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [logs, setLogs] = useState<string[]>([]);
    const [vapidKey, setVapidKey] = useState<string | undefined>(undefined);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
        console.log(message);
    };

    useEffect(() => {
        // Check if VAPID key is loaded
        const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        setVapidKey(key);
        addLog(`VAPID Key check: ${key ? 'FOUND (' + key.substring(0, 20) + '...)' : 'MISSING!'}`);

        checkPushStatus();
    }, []);

    const checkPushStatus = async () => {
        addLog("Checking push status...");

        if (!("serviceWorker" in navigator)) {
            setStatus("❌ Service Worker desteklenmiyor");
            addLog("ERROR: Service Worker not supported");
            return;
        }

        if (!("PushManager" in window)) {
            setStatus("❌ Push Manager desteklenmiyor");
            addLog("ERROR: Push Manager not supported");
            return;
        }

        setPermission(Notification.permission);
        addLog(`Notification permission: ${Notification.permission}`);

        try {
            const registration = await navigator.serviceWorker.ready;
            addLog("Service Worker is ready");

            const sub = await registration.pushManager.getSubscription();

            if (sub) {
                setSubscription(sub);
                setStatus("✅ Push subscription aktif");
                addLog("Push subscription found");
            } else {
                setStatus("⚠️ Push subscription yok");
                addLog("No push subscription found");
            }
        } catch (error) {
            setStatus("❌ Hata: " + error);
            addLog("ERROR: " + error);
        }
    };

    const requestPermission = async () => {
        addLog("Requesting notification permission...");
        const perm = await Notification.requestPermission();
        setPermission(perm);
        addLog(`Permission result: ${perm}`);
        if (perm === "granted") {
            addLog("Reloading page...");
            window.location.reload();
        }
    };

    const testLocalNotification = async () => {
        addLog("Testing local notification...");
        if (Notification.permission === "granted") {
            new Notification("Test Bildirimi (Local)", {
                body: "Bu bir local test bildirimidir",
                icon: "/logo.jpg",
            });
            addLog("Local notification sent");
        } else {
            addLog("ERROR: Permission not granted");
        }
    };

    const testServerNotification = async () => {
        if (!session?.user?.id) {
            addLog("ERROR: User not logged in");
            return;
        }

        addLog("Sending server notification...");
        try {
            await createNotification(
                parseInt(session.user.id),
                "Test Push Notification",
                "Bu bir server-side test bildirimidir",
                "INFO",
                "/"
            );
            addLog("Server notification sent successfully - check console for [sendPushNotification] logs");
        } catch (error) {
            addLog("ERROR sending server notification: " + error);
        }
    };

    return (
        <div className="p-8 space-y-6 max-w-4xl">
            <h1 className="text-3xl font-bold">Push Notification Debug</h1>

            <div className="space-y-4">
                {!vapidKey && (
                    <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg">
                        <h2 className="font-semibold mb-2 text-red-200">❌ VAPID Key Eksik!</h2>
                        <p className="text-sm text-red-100">
                            NEXT_PUBLIC_VAPID_PUBLIC_KEY environment variable yüklenemedi.
                            <br />
                            .env dosyasını kontrol edin ve dev server'ı yeniden başlatın.
                        </p>
                    </div>
                )}

                {vapidKey && (
                    <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg">
                        <h2 className="font-semibold mb-2 text-green-200">✅ VAPID Key Yüklendi</h2>
                        <p className="text-xs text-green-100 font-mono">
                            {vapidKey.substring(0, 40)}...
                        </p>
                    </div>
                )}

                <div className="p-4 bg-card rounded-lg border">
                    <h2 className="font-semibold mb-2">Durum</h2>
                    <p className="text-lg">{status}</p>
                </div>

                <div className="p-4 bg-card rounded-lg border">
                    <h2 className="font-semibold mb-2">İzin Durumu</h2>
                    <p className="text-lg">
                        {permission === "granted" && "✅ İzin verildi"}
                        {permission === "denied" && "❌ İzin reddedildi"}
                        {permission === "default" && "⚠️ İzin istenmedi"}
                    </p>
                </div>

                <div className="p-4 bg-card rounded-lg border">
                    <h2 className="font-semibold mb-2">Kullanıcı</h2>
                    <p className="text-sm">
                        {session?.user ? `✅ Logged in as: ${session.user.name} (ID: ${session.user.id})` : "❌ Not logged in"}
                    </p>
                </div>

                {subscription && (
                    <div className="p-4 bg-card rounded-lg border">
                        <h2 className="font-semibold mb-2">Subscription Detayları</h2>
                        <pre className="text-xs overflow-auto max-h-40 bg-black/20 p-2 rounded">
                            {JSON.stringify(subscription.toJSON(), null, 2)}
                        </pre>
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {permission !== "granted" && (
                        <Button onClick={requestPermission}>
                            İzin İste
                        </Button>
                    )}

                    <Button onClick={checkPushStatus} variant="outline">
                        Durumu Yenile
                    </Button>

                    {permission === "granted" && vapidKey && (
                        <>
                            <Button onClick={testLocalNotification} variant="secondary">
                                Test: Local Notification
                            </Button>

                            <Button onClick={testServerNotification} className="bg-green-600 hover:bg-green-700">
                                Test: Server Push Notification
                            </Button>
                        </>
                    )}
                </div>

                <div className="p-4 bg-card rounded-lg border">
                    <h2 className="font-semibold mb-2">Debug Logs</h2>
                    <div className="text-xs font-mono space-y-1 max-h-60 overflow-auto bg-black/20 p-2 rounded">
                        {logs.map((log, i) => (
                            <div key={i} className={log.includes('ERROR') ? 'text-red-400' : log.includes('SUCCESS') || log.includes('FOUND') ? 'text-green-400' : ''}>{log}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
