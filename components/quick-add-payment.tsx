"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
import { Wallet, Search, X } from "lucide-react";
import { createPayment } from "@/app/actions/payment";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const selectedClient = clients.find(c => c.id.toString() === selectedClientId);
    const activeServices = selectedClient?.services || [];

    // Filter clients based on search term
    const filteredClients = useMemo(() => {
        if (!searchTerm) return clients;
        return clients.filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [clients, searchTerm]);

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Update search term when a client is selected
    useEffect(() => {
        if (selectedClientId) {
            const client = clients.find(c => c.id.toString() === selectedClientId);
            if (client) {
                setSearchTerm(client.name);
            }
        } else {
            setSearchTerm("");
        }
    }, [selectedClientId, clients]);

    async function onSubmit(formData: FormData) {
        try {
            await createPayment(formData);
            setOpen(false);
            setSearchTerm("");
            setSelectedClientId("");
            router.refresh();
        } catch (error) {
            alert("Ödeme eklenirken bir hata oluştu: " + (error as Error).message);
        }
    }

    const handleSelectClient = (client: typeof clients[0]) => {
        setSelectedClientId(client.id.toString());
        setSearchTerm(client.name);
        setIsDropdownOpen(false);
    };

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
                    <div className="grid gap-2 relative" ref={dropdownRef}>
                        <Label htmlFor="clientId" className="text-white/70">Danışan</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                            <Input
                                type="text"
                                placeholder="Danışan ara..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setIsDropdownOpen(true);
                                    if (selectedClientId) setSelectedClientId(""); // Clear selection on type
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                className="pl-9 glass-input text-white rounded-xl border-white/10"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedClientId("");
                                        setIsDropdownOpen(true);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full bg-[#0f1021] border border-white/10 rounded-xl shadow-xl z-[9999] max-h-[200px] overflow-y-auto">
                                {filteredClients.length > 0 ? (
                                    <ul className="py-1">
                                        {filteredClients.map((client) => (
                                            <li
                                                key={client.id}
                                                onClick={() => handleSelectClient(client)}
                                                className={cn(
                                                    "px-4 py-2 text-sm cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-between",
                                                    selectedClientId === client.id.toString() && "bg-white/5 text-green-400"
                                                )}
                                            >
                                                <span>{client.name}</span>
                                                {selectedClientId === client.id.toString() && (
                                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-4 text-center text-sm text-white/50">
                                        Danışan bulunamadı.
                                    </div>
                                )}
                            </div>
                        )}
                        <input type="hidden" name="clientId" value={selectedClientId} />
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
