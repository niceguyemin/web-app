"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Play, RefreshCw } from "lucide-react";

export default function WhatsAppTestPage() {
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("Merhaba, bu bir test mesajıdır.");
    const [loading, setLoading] = useState(false);
    const [cronResult, setCronResult] = useState<any>(null);

    const handleTriggerCron = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/cron/reminders");
            const data = await res.json();
            setCronResult(data);
            toast.success("Hatırlatma servisi tetiklendi");
        } catch (error) {
            toast.error("Servis tetiklenirken hata oluştu");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-text-heading">WhatsApp Test Merkezi</h2>
                <p className="text-text-muted">Entegrasyonları buradan manuel olarak test edebilirsiniz.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Manuel Test Kartı */}
                <Card className="card border-0">
                    <CardHeader>
                        <CardTitle className="text-text-heading">Manuel Buton Testi</CardTitle>
                        <CardDescription className="text-text-muted">
                            WhatsApp butonunun doğru çalışıp çalışmadığını kontrol edin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-text-base">Telefon Numarası</Label>
                            <Input
                                placeholder="555 123 45 67"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="glass-input text-text-base"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-text-base">Mesaj</Label>
                            <Textarea
                                placeholder="Mesajınız..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="glass-input text-text-base"
                            />
                        </div>
                        <div className="pt-2">
                            <WhatsAppButton
                                phoneNumber={phone}
                                message={message}
                                className="w-full"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Sistem Test Kartı */}
                <Card className="card border-0">
                    <CardHeader>
                        <CardTitle className="text-text-heading">Sistem Tetikleyici</CardTitle>
                        <CardDescription className="text-text-muted">
                            Hatırlatma servisini (Cron Job) manuel olarak çalıştırın.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-background-dark/50 border border-white/5 text-sm space-y-2">
                            <p className="text-text-muted">
                                Bu işlem, <strong>önümüzdeki 30-40 dakika</strong> içindeki randevuları tarar ve diyetisyene bildirim gönderir.
                            </p>
                        </div>

                        <Button
                            onClick={handleTriggerCron}
                            disabled={loading}
                            className="w-full btn-primary"
                        >
                            {loading ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Play className="mr-2 h-4 w-4" />
                            )}
                            Servisi Şimdi Çalıştır
                        </Button>

                        {cronResult && (
                            <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                <h4 className="font-medium text-green-400 mb-1">Sonuç:</h4>
                                <pre className="text-xs text-green-300/80 overflow-auto">
                                    {JSON.stringify(cronResult, null, 2)}
                                </pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
