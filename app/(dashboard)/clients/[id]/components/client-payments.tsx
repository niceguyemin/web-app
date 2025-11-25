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

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Ödemeler</CardTitle>
                    <CardDescription>Geçmiş ödeme kayıtları.</CardDescription>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Ödeme Ekle
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ödeme Al</DialogTitle>
                        </DialogHeader>
                        <form
                            action={async (formData) => {
                                try {
                                    setError(null);
                                    await createPayment(formData);
                                    setOpen(false);
                                } catch (err) {
                                    setError(err instanceof Error ? err.message : "Bir hata oluştu");
                                }
                            }}
                            className="space-y-4"
                        >
                            <input type="hidden" name="clientId" value={client.id} />

                            <div className="grid gap-2">
                                <Label>Hizmet</Label>
                                <Select name="serviceId" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Hizmet Seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {client.services.map((s) => (
                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                {s.type} ({s.totalPrice} TL)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Tutar (TL)</Label>
                                <Input
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Ödeme Türü</Label>
                                <Select name="type" defaultValue="Nakit">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Nakit">Nakit</SelectItem>
                                        <SelectItem value="Kredi Kartı">Kredi Kartı</SelectItem>
                                        <SelectItem value="Havale/EFT">Havale/EFT</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {error && (
                                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full">
                                Kaydet
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="border-green-200 bg-green-50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-700">Toplam Ödenen</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-700">
                                ₺{(() => {
                                    const totalPaid = client.services.reduce((total: number, service) => {
                                        const servicePaid = (service.payments || []).reduce((sum: number, p) => sum + p.amount, 0);
                                        return total + servicePaid;
                                    }, 0);
                                    return totalPaid.toFixed(2);
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-red-700">Toplam Kalan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-700">
                                ₺{(() => {
                                    const totalRemaining = client.services.reduce((total: number, service) => {
                                        const servicePaid = (service.payments || []).reduce((sum: number, p) => sum + p.amount, 0);
                                        const remaining = service.totalPrice - servicePaid;
                                        return total + (remaining > 0 ? remaining : 0);
                                    }, 0);
                                    return totalRemaining.toFixed(2);
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Payments Table */}
                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="p-3 text-left font-medium">Tarih</th>
                                <th className="p-3 text-left font-medium">Hizmet</th>
                                <th className="p-3 text-left font-medium">Tür</th>
                                <th className="p-3 text-right font-medium">Tutar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {client.payments.map((payment) => {
                                const service = client.services.find((s) => s.id === payment.serviceId);
                                return (
                                    <tr key={payment.id} className="border-b last:border-0">
                                        <td className="p-3">
                                            {format(payment.date, "d MMMM yyyy HH:mm", { locale: tr })}
                                        </td>
                                        <td className="p-3">
                                            {service ? service.type : "Genel"}
                                        </td>
                                        <td className="p-3">{payment.type || "-"}</td>
                                        <td className="p-3 text-right font-medium">
                                            ₺{payment.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })}
                            {client.payments.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                        Ödeme kaydı yok.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
