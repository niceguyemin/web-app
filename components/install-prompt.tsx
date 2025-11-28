"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import { toast } from "sonner";

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Check if user has already dismissed it recently
            const dismissed = localStorage.getItem("installPromptDismissed");
            if (!dismissed) {
                setShowPrompt(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setDeferredPrompt(null);
            setShowPrompt(false);
            toast.success("Uygulama yükleniyor...");
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem("installPromptDismissed", "true");
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-popover border border-white/10 rounded-xl shadow-2xl p-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">Uygulamayı Yükle</h3>
                    <p className="text-sm text-white/70 mb-3">
                        Daha hızlı erişim ve çevrimdışı kullanım için uygulamayı ana ekranınıza ekleyin.
                    </p>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={handleInstall}
                            className="bg-primary hover:bg-primary/90 text-white"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Yükle
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDismiss}
                            className="text-white/50 hover:text-white"
                        >
                            Daha Sonra
                        </Button>
                    </div>
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-white/30 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
