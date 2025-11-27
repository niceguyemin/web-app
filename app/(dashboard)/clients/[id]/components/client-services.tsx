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
import { Plus, Minus, Trash } from "lucide-react";
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
import { createService, deductSession, deleteService } from "@/app/actions/service";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface ClientServicesProps {
    client: Client & {
        services: (Service & { payments: Payment[] })[];
    };
    serviceTypes: { id: number; name: string; active: boolean }[];
}

export function ClientServices({ client, serviceTypes }: ClientServicesProps) {
    const [open, setOpen] = useState(false);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Hizmetler</CardTitle>
                    <CardDescription>
                        Danışanın aldığı paketler ve kalan seanslar.
                    </CardDescription>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Hizmet Ekle
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Yeni Hizmet Ekle</DialogTitle>
                        </DialogHeader>
                        <form
                            action={async (formData) => {
                                try {
                                    await createService(formData);
                                    toast.success("Hizmet başarıyla eklendi");
                                    setOpen(false);
                                } catch (error) {
                                    toast.error("Hizmet eklenirken bir hata oluştu");
                                }
                            }}
                            className="space-y-4"
                        >
                            <input type="hidden" name="clientId" value={client.id} />
                            <div className="grid gap-2">
                                <Label>Hizmet Türü</Label>
                                <Select name="type" required defaultValue={serviceTypes[0]?.name}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {serviceTypes.map((t) => (
                                            <SelectItem key={t.id} value={t.name}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Toplam Seans</Label>
                                <Input
                                    name="totalSessions"
                                    type="number"
                                    defaultValue="1"
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Toplam Tutar (TL)</Label>
                                <Input
                                    name="totalPrice"
                                    type="number"
                                    defaultValue="0"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Kaydet
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {client.services.map((service) => {
                        const paid = service.payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
                        const remaining = service.totalPrice - paid;

                        return (
                            <div
                                key={service.id}
                                className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4"
                            >
                                <div className="space-y-1">
                                    <p className="font-medium">{service.type}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(service.createdAt, "d MMMM yyyy", { locale: tr })}
                                    </p>
                                    <div className="text-sm">
                                        <span className={remaining > 0 ? "text-red-500 font-bold" : "text-green-600"}>
                                            Kalan: ₺{remaining.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">
                                            {service.remainingSessions}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Kalan</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={service.remainingSessions <= 0}
                                            onClick={async () => {
                                                try {
                                                    await deductSession(service.id, client.id);
                                                    toast.success("Seans düşüldü");
                                                } catch (error) {
                                                    toast.error("İşlem başarısız");
                                                }
                                            }}
                                        >
                                            <Minus className="h-4 w-4 mr-1" />
                                            Seans Düş
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={async () => {
                                                if (confirm("Silmek istediğinize emin misiniz?")) {
                                                    try {
                                                        await deleteService(service.id, client.id);
                                                        toast.success("Hizmet silindi");
                                                    } catch (error) {
                                                        toast.error("Silme işlemi başarısız");
                                                    }
                                                }
                                            }}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {client.services.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            Henüz hizmet eklenmemiş.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
