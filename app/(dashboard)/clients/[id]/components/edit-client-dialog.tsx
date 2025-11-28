"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { updateClient } from "@/app/actions/client";
import { Client } from "@prisma/client";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditClientDialogProps {
    client: Client;
}

export function EditClientDialog({ client }: EditClientDialogProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    async function onSubmit(formData: FormData) {
        try {
            await updateClient(formData);
            toast.success("Danışan güncellendi");
            setOpen(false);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                    <Pencil className="h-4 w-4 mr-2" />
                    Düzenle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-w-[95vw] bg-[#0f1021] border-white/10 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Danışan Bilgilerini Düzenle</DialogTitle>
                    <DialogDescription className="text-white/50">
                        Danışan bilgilerini güncelleyin.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="grid gap-4 py-4">
                    <input type="hidden" name="id" value={client.id} />
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-white/70">Ad Soyad</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={client.name}
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
                                defaultValue={client.phone?.replace(/^\+90/, "") || ""}
                                placeholder="545 654 4533"
                                maxLength={10}
                                className="glass-input text-white rounded-l-none rounded-r-xl border-white/10"
                                onInput={(e) => {
                                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 10);
                                }}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="gender" className="text-white/70">Cinsiyet</Label>
                            <Input
                                id="gender"
                                name="gender"
                                defaultValue={client.gender || ""}
                                placeholder="Male/Female"
                                className="glass-input text-white rounded-xl border-white/10"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="birthDate" className="text-white/70">Doğum Tarihi</Label>
                            <Input
                                id="birthDate"
                                name="birthDate"
                                type="date"
                                defaultValue={client.birthDate || ""}
                                className="glass-input text-white rounded-xl border-white/10"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes" className="text-white/70">Notlar</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            defaultValue={client.notes || ""}
                            className="glass-input text-white rounded-xl border-white/10 min-h-[100px]"
                        />
                    </div>
                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                        Güncelle
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
