"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { createAppointment } from "@/app/actions/appointment";
import { Plus } from "lucide-react";
import { Client, Service, User } from "@prisma/client";

interface CreateAppointmentDialogProps {
    clients: (Client & { services: Service[] })[];
    users: User[];
}

export function CreateAppointmentDialog({ clients, users }: CreateAppointmentDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const selectedClient = clients.find((c) => c.id.toString() === selectedClientId);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl">
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Randevu
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-white">Randevu Oluştur</DialogTitle>
                </DialogHeader>
                <form
                    action={async (formData) => {
                        try {
                            setError(null);
                            await createAppointment(formData);
                            setOpen(false);
                            setSelectedClientId("");
                        } catch (err) {
                            setError(err instanceof Error ? err.message : "Bir hata oluştu");
                        }
                    }}
                    className="space-y-4"
                >
                    <div className="grid gap-2">
                        <Label className="text-white/70">Danışan</Label>
                        <Select
                            name="clientId"
                            required
                            onValueChange={setSelectedClientId}
                            value={selectedClientId}
                        >
                            <SelectTrigger className="glass-input text-white rounded-xl border-white/10">
                                <SelectValue placeholder="Danışan Seçin" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1b4b] border-white/10 text-white">
                                {clients.map((client) => (
                                    <SelectItem
                                        key={client.id}
                                        value={client.id.toString()}
                                        className="focus:bg-white/10 focus:text-white"
                                    >
                                        {client.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-white/70">Uzman (Opsiyonel)</Label>
                        <Select name="userId">
                            <SelectTrigger className="glass-input text-white rounded-xl border-white/10">
                                <SelectValue placeholder="Uzman Seçin" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1b4b] border-white/10 text-white">
                                {users.map((user) => (
                                    <SelectItem
                                        key={user.id}
                                        value={user.id.toString()}
                                        className="focus:bg-white/10 focus:text-white"
                                    >
                                        <div className="flex items-center gap-2">
                                            {user.color && (
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: user.color }} />
                                            )}
                                            {user.name || user.username}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedClient && selectedClient.services.length > 0 && (
                        <div className="grid gap-2">
                            <Label className="text-white/70">Hizmet (Opsiyonel)</Label>
                            <Select name="serviceId">
                                <SelectTrigger className="glass-input text-white rounded-xl border-white/10">
                                    <SelectValue placeholder="Hizmet Seçin" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1b4b] border-white/10 text-white">
                                    {selectedClient.services.map((service) => (
                                        <SelectItem
                                            key={service.id}
                                            value={service.id.toString()}
                                            className="focus:bg-white/10 focus:text-white"
                                        >
                                            {service.type} ({service.remainingSessions} seans kaldı)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-white/70">Tarih</Label>
                            <Input
                                name="date"
                                type="date"
                                required
                                className="glass-input text-white rounded-xl border-white/10 [color-scheme:dark]"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-white/70">Saat</Label>
                            <Input
                                name="time"
                                type="time"
                                required
                                className="glass-input text-white rounded-xl border-white/10 [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-white/70">Notlar</Label>
                        <Textarea
                            name="notes"
                            className="glass-input text-white rounded-xl border-white/10 min-h-[100px]"
                            placeholder="Randevu notları..."
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl">
                        Oluştur
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
