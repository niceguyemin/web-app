import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-popover text-white p-4">
            <div className="glass-card p-12 rounded-3xl flex flex-col items-center text-center max-w-md w-full border-white/10 shadow-2xl shadow-blue-900/20">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10">
                    <FileQuestion className="w-12 h-12 text-blue-400" />
                </div>

                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Sayfa Bulunamadı
                </h1>

                <p className="text-white/50 mb-8 text-lg">
                    Aradığınız sayfa mevcut değil veya taşınmış olabilir.
                </p>

                <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 h-12 rounded-xl text-base font-medium transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-blue-500/25">
                    <Link href="/">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Ana Sayfaya Dön
                    </Link>
                </Button>
            </div>
        </div>
    );
}
