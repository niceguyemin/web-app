"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="tr" className="dark">
            <body className={`${inter.className} bg-[#0f1021] text-white antialiased`}>
                <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
                    <div className="glass-card p-12 rounded-3xl flex flex-col items-center text-center max-w-md w-full border-white/10 shadow-2xl shadow-red-900/20">
                        <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/20">
                            <AlertTriangle className="w-12 h-12 text-red-400" />
                        </div>

                        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            Kritik Hata
                        </h1>

                        <p className="text-white/50 mb-8">
                            Uygulama yüklenirken kritik bir hata oluştu.
                        </p>

                        <Button
                            onClick={reset}
                            className="w-full bg-white/10 hover:bg-white/20 text-white border-0 h-12 rounded-xl text-base font-medium transition-all duration-300"
                        >
                            <RefreshCcw className="w-5 h-5 mr-2" />
                            Yeniden Yükle
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    );
}
