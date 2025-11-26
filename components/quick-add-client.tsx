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
import { Plus } from "lucide-react";
import { createClient } from "@/app/actions/client";
import { useRouter } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ServiceType } from "@prisma/client";

interface QuickAddClientProps {
    serviceTypes?: ServiceType[];
}

export function QuickAddClient({ serviceTypes = [] }: QuickAddClientProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    async function onSubmit(formData: FormData) {
        await createClient(formData);
        setOpen(false);
        router.refresh();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Danışan Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-w-[95vw] bg-[#0f1021] border-white/10 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Hızlı Danışan Ekle</DialogTitle>
                    <DialogDescription className="text-white/50">
                        Sadece isim ve telefon ile hızlıca kayıt oluşturun.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-white/70">Ad Soyad</Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            className="glass-input text-white rounded-xl border-white/10"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone" className="text-white/70">Telefon</Label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-white/10 bg-white/5 text-white/50 text-sm">
                                +90
                            </span>
                            <Input
                                id="phone"
                                name="phone"
                                placeholder="545 654 4533"
                                maxLength={10}
                                className="glass-input text-white rounded-l-none rounded-r-xl border-white/10"
                                onInput={(e) => {
                                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 10);
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="serviceType" className="text-white/70">Hizmet Türü</Label>
                        <Select name="serviceType">
                            <SelectTrigger className="glass-input text-white rounded-xl border-white/10">
                                <SelectValue placeholder="Hizmet Seçiniz" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0f1021] border-white/10 text-white">
                                {serviceTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.name}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="serviceSessions" className="text-white/70">Seans Sayısı</Label>
                            <Input
                                id="serviceSessions"
                                name="serviceSessions"
                                type="number"
                                placeholder="Örn: 8"
                                className="glass-input text-white rounded-xl border-white/10"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="servicePrice" className="text-white/70">Toplam Fiyat (₺)</Label>
                            <Input
                                id="servicePrice"
                                name="servicePrice"
                                type="number"
                                placeholder="Örn: 5000"
                                className="glass-input text-white rounded-xl border-white/10"
                            />
                        </div>
                    </div>
                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                        Kaydet
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
