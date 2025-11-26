"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Wallet } from "lucide-react";
import { createPayment } from "@/app/actions/payment";
import { useRouter } from "next/navigation";

interface QuickAddPaymentProps {
    clients: {
        id: number;
        name: string;
        services: {
            id: number;
            type: string;
            totalPrice: number;
            payments: { amount: number }[];
        }[];
    }[];
}

export function QuickAddPayment({ clients }: QuickAddPaymentProps) {
    const [open, setOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const router = useRouter();

    const selectedClient = clients.find(c => c.id.toString() === selectedClientId);
    const activeServices = selectedClient?.services || [];

    async function onSubmit(formData: FormData) {
        try {
            await createPayment(formData);
            setOpen(false);
            router.refresh();
        } catch (error) {
            alert("Ödeme eklenirken bir hata oluştu: " + (error as Error).message);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-500">
                    <Wallet className="h-4 w-4 mr-2" />
                    Ödeme Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-w-[95vw] bg-[#0f1021] border-white/10 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Hızlı Ödeme Ekle</DialogTitle>
                    <DialogDescription className="text-white/50">
                        Danışan ve tutar seçerek ödeme alın.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="clientId" className="text-white/70">Danışan</Label>
                        <Select name="clientId" onValueChange={setSelectedClientId} required>
                            <SelectTrigger className="glass-input text-white rounded-xl border-white/10">
                                <SelectValue placeholder="Danışan Seçiniz" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0f1021] border-white/10 text-white max-h-[200px]">
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id.toString()}>
                                        {client.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {activeServices.length > 0 && (
                        <div className="grid gap-2">
                            <Label htmlFor="serviceId" className="text-white/70">Hizmet (Opsiyonel)</Label>
                            <Select name="serviceId">
                                <SelectTrigger className="glass-input text-white rounded-xl border-white/10">
                                    <SelectValue placeholder="Hizmet Seçiniz" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0f1021] border-white/10 text-white">
                                    {activeServices.map((service) => {
                                        const paid = service.payments.reduce((sum, p) => sum + p.amount, 0);
                                        const remaining = service.totalPrice - paid;
                                        return (
                                            <SelectItem key={service.id} value={service.id.toString()}>
                                                {service.type} (Kalan: {remaining} ₺)
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="amount" className="text-white/70">Tutar (₺)</Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            required
                            className="glass-input text-white rounded-xl border-white/10"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="type" className="text-white/70">Ödeme Yöntemi</Label>
                        <Select name="type" defaultValue="Nakit">
                            <SelectTrigger className="glass-input text-white rounded-xl border-white/10">
                                <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0f1021] border-white/10 text-white">
                                <SelectItem value="Nakit">Nakit</SelectItem>
                                <SelectItem value="Kredi Kartı">Kredi Kartı</SelectItem>
                                <SelectItem value="Havale/EFT">Havale/EFT</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                        Ödeme Al
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
