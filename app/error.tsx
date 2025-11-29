"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    const isVersionMismatch = error.message.includes("Server Action") || error.message.includes("failed to find server action") || error.digest?.includes("MINIFIED_REACT_ERROR");

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-popover text-white p-4">
            <div className="glass-card p-12 rounded-3xl flex flex-col items-center text-center max-w-md w-full border-white/10 shadow-2xl shadow-red-900/20">
                <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/20">
                    <AlertTriangle className="w-12 h-12 text-red-400" />
                </div>

                <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    {isVersionMismatch ? "Güncelleme Gerekli" : "Bir Hata Oluştu"}
                </h1>

                <p className="text-white/50 mb-8">
                    {isVersionMismatch
                        ? "Uygulamanın yeni bir versiyonu mevcut. Devam etmek için sayfayı yenileyin."
                        : "Beklenmedik bir sorunla karşılaştık. Lütfen tekrar deneyin."}
                </p>

                <div className="flex flex-col gap-3 w-full">
                    <Button
                        onClick={() => {
                            if (isVersionMismatch) {
                                window.location.reload();
                            } else {
                                reset();
                            }
                        }}
                        className="w-full bg-white/10 hover:bg-white/20 text-white border-0 h-12 rounded-xl text-base font-medium transition-all duration-300"
                    >
                        <RefreshCcw className="w-5 h-5 mr-2" />
                        {isVersionMismatch ? "Uygulamayı Güncelle" : "Tekrar Dene"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
