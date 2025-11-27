"use client";

import { Client, Service, Payment } from "@prisma/client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createPayment } from "@/app/actions/payment";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface ClientPaymentsProps {
    client: Client & {
        services: (Service & { payments: Payment[] })[];
        payments: Payment[];
    };
}

export function ClientPayments({ client }: ClientPaymentsProps) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate totals
    const totalDebt = client.services.reduce((acc, service) => acc + (service.totalPrice || 0), 0);
    const totalPaid = client.payments.reduce((acc, payment) => acc + payment.amount, 0);
    const remainingDebt = totalDebt - totalPaid;

    return (
        <Card className="glass-card border-0">
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-white">Ödemeler</CardTitle>
                        <CardDescription className="text-white/50">Geçmiş ödeme kayıtları.</CardDescription>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl">
                                <Plus className="mr-2 h-4 w-4" />
                                Ödeme Ekle
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-panel border-white/10 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-white">Ödeme Al</DialogTitle>
                            </DialogHeader>
                            <form
                                action={async (formData) => {
                                    try {
                                        setError(null);
                                        await createPayment(formData);
                                        toast.success("Ödeme başarıyla alındı");
                                        setOpen(false);
                                    } catch (err) {
                                        setError(err instanceof Error ? err.message : "Bir hata oluştu");
                                    }
                                }}
                                className="space-y-4"
                            >
                                <input type="hidden" name="clientId" value={client.id} />

                                <div className="grid gap-2">
                                    <Label className="text-white/70">Hizmet</Label>
                                    <Select name="serviceId" required>
                                        <SelectTrigger className="glass-input text-white rounded-xl border-white/10">
                                            <SelectValue placeholder="Hizmet Seçin" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1b4b] border-white/10 text-white">
                                            {client.services.map((s) => (
                                                <SelectItem key={s.id} value={s.id.toString()} className="focus:bg-white/10 focus:text-white">
                                                    {s.type} ({s.totalPrice} TL)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-white/70">Tutar (TL)</Label>
                                    <Input
                                        name="amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        className="glass-input text-white rounded-xl border-white/10"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-white/70">Ödeme Türü</Label>
                                    <Select name="type" defaultValue="Nakit">
                                        <SelectTrigger className="glass-input text-white rounded-xl border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1b4b] border-white/10 text-white">
                                            <SelectItem value="Nakit" className="focus:bg-white/10 focus:text-white">Nakit</SelectItem>
                                            <SelectItem value="Kredi Kartı" className="focus:bg-white/10 focus:text-white">Kredi Kartı</SelectItem>
                                            <SelectItem value="Havale/EFT" className="focus:bg-white/10 focus:text-white">Havale/EFT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                                        {error}
                                    </div>
                                )}

                                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl">
                                    Kaydet
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Summary Stats */}
                <div className="grid gap-3 md:gap-4 grid-cols-3 mt-6">
                    <div className="text-center">
                        <p className="text-white/50 text-xs md:text-sm mb-1">Toplam Ödenen</p>
                        <p className="text-xl md:text-2xl font-bold text-green-500">{totalPaid.toFixed(2)} ₺</p>
                    </div>
                    <div className="text-center">
                        <p className="text-white/50 text-xs md:text-sm mb-1">Kalan Borç</p>
                        <p className={`text-xl md:text-2xl font-bold ${remainingDebt > 0 ? 'text-red-400' : 'text-green-500'}`}>
                            {remainingDebt.toFixed(2)} ₺
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-white/50 text-xs md:text-sm mb-1">Toplam Borç</p>
                        <p className="text-xl md:text-2xl font-bold text-white">{totalDebt.toFixed(2)} ₺</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Payments Table */}
                <div className="rounded-xl border border-white/10 glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="p-3 text-left font-medium text-white/70">Tarih</th>
                                    <th className="p-3 text-left font-medium text-white/70">Hizmet</th>
                                    <th className="p-3 text-left font-medium text-white/70">Tür</th>
                                    <th className="p-3 text-right font-medium text-white/70">Tutar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {client.payments.map((payment) => {
                                    const service = client.services.find((s) => s.id === payment.serviceId);
                                    return (
                                        <tr key={payment.id} className="border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors">
                                            <td className="p-3 text-white">
                                                {format(payment.date, "d MMMM yyyy HH:mm", { locale: tr })}
                                            </td>
                                            <td className="p-3 text-white">
                                                {service ? service.type : "Genel"}
                                            </td>
                                            <td className="p-3 text-white">{payment.type || "-"}</td>
                                            <td className="p-3 text-right font-medium text-white">
                                                ₺{payment.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {client.payments.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-white/50">
                                            Ödeme kaydı yok.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
