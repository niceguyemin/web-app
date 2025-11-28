"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/app/actions/client";

interface ServiceType {
    id: number;
    name: string;
    defaultPrice?: number | null;
}

interface CreateClientDialogProps {
    serviceTypes: ServiceType[];
}

export function CreateClientDialog({ serviceTypes }: CreateClientDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        serviceType: "",
        servicePrice: "",
        serviceSessions: "",
        height: "",
        weight: "",
        birthDate: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const clientData = {
                name: formData.name,
                phone: formData.phone,
                email: formData.email || undefined,
                height: formData.height ? parseFloat(formData.height) : undefined,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
            };

            const serviceData = formData.serviceType
                ? {
                    name: serviceTypes.find((s) => s.id.toString() === formData.serviceType)?.name ?? "",
                    price: formData.servicePrice,
                    sessions: formData.serviceSessions,
                }
                : undefined;

            const payload = new FormData();
            payload.append("name", clientData.name);
            payload.append("phone", clientData.phone);
            if (clientData.email) payload.append("email", clientData.email);
            if (clientData.height !== undefined) payload.append("height", clientData.height.toString());
            if (clientData.weight !== undefined) payload.append("weight", clientData.weight.toString());
            if (clientData.birthDate) payload.append("birthDate", clientData.birthDate.toISOString().split("T")[0]);
            if (serviceData?.name) payload.append("serviceType", serviceData.name);
            if (serviceData?.price) payload.append("servicePrice", serviceData.price);
            if (serviceData?.sessions) payload.append("serviceSessions", serviceData.sessions);

            await createClient(payload);
            toast.success("Danışan başarıyla eklendi");

            setOpen(false);
            setFormData({
                name: "",
                phone: "",
                email: "",
                serviceType: "",
                servicePrice: "",
                serviceSessions: "",
                height: "",
                weight: "",
                birthDate: "",
            });
            setShowAdvanced(false);
            router.refresh();
        } catch (error) {
            console.error("Error creating client:", error);
            toast.error(error instanceof Error ? error.message : "Danışan eklenirken bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    const handleServiceTypeChange = (value: string) => {
        setFormData({ ...formData, serviceType: value });
        const selectedService = serviceTypes.find((s) => s.id.toString() === value);
        if (selectedService?.defaultPrice) {
            setFormData({
                ...formData,
                serviceType: value,
                servicePrice: selectedService.defaultPrice.toString(),
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/20 rounded-xl transition-all duration-200 hover:scale-[1.02] border-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Danışan
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 text-white max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl">Yeni Danışan Ekle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Temel Bilgiler */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="text-white/70">
                                Ad Soyad *
                            </Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="glass-input text-white rounded-xl"
                                placeholder="Örn: Ahmet Yılmaz"
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone" className="text-white/70">
                                Telefon *
                            </Label>
                            <div className="flex gap-2">
                                <div className="w-16 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 flex items-center justify-center text-sm">
                                    +90
                                </div>
                                <Input
                                    id="phone"
                                    required
                                    type="tel"
                                    maxLength={10}
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "");
                                        setFormData({ ...formData, phone: value });
                                    }}
                                    className="glass-input text-white rounded-xl flex-1"
                                    placeholder="5XX XXX XXXX"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="email" className="text-white/70">
                                E-posta
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="glass-input text-white rounded-xl"
                                placeholder="ornek@email.com"
                            />
                        </div>
                    </div>

                    {/* Hizmet Bilgileri */}
                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <h3 className="text-sm font-medium text-white/70">Hizmet Bilgileri</h3>

                        <div>
                            <Label htmlFor="serviceType" className="text-white/70">
                                Hizmet Türü
                            </Label>
                            <Select value={formData.serviceType} onValueChange={handleServiceTypeChange}>
                                <SelectTrigger className="glass-input text-white rounded-xl border-white/10">
                                    <SelectValue placeholder="Hizmet seçin" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1b4b] border-white/10 text-white">
                                    {serviceTypes.map((service) => (
                                        <SelectItem
                                            key={service.id}
                                            value={service.id.toString()}
                                            className="focus:bg-white/10 focus:text-white"
                                        >
                                            {service.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.serviceType && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="servicePrice" className="text-white/70">
                                        Ücret (₺)
                                    </Label>
                                    <Input
                                        id="servicePrice"
                                        type="number"
                                        step="0.01"
                                        value={formData.servicePrice}
                                        onChange={(e) => setFormData({ ...formData, servicePrice: e.target.value })}
                                        className="glass-input text-white rounded-xl"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="serviceSessions" className="text-white/70">
                                        Seans Sayısı
                                    </Label>
                                    <Input
                                        id="serviceSessions"
                                        type="number"
                                        value={formData.serviceSessions}
                                        onChange={(e) => setFormData({ ...formData, serviceSessions: e.target.value })}
                                        className="glass-input text-white rounded-xl"
                                        placeholder="1"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Gelişmiş Bilgiler (Gizli Çekmece) */}
                    <div className="pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center justify-between w-full text-sm text-white/70 hover:text-white transition-colors"
                        >
                            <span>Ek Bilgiler (Boy, Kilo, Doğum Tarihi)</span>
                            {showAdvanced ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </button>

                        {showAdvanced && (
                            <div className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="height" className="text-white/70">
                                            Boy (cm)
                                        </Label>
                                        <Input
                                            id="height"
                                            type="number"
                                            step="0.1"
                                            value={formData.height}
                                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                            className="glass-input text-white rounded-xl"
                                            placeholder="170"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="weight" className="text-white/70">
                                            Kilo (kg)
                                        </Label>
                                        <Input
                                            id="weight"
                                            type="number"
                                            step="0.1"
                                            value={formData.weight}
                                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                            className="glass-input text-white rounded-xl"
                                            placeholder="70"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="birthDate" className="text-white/70">
                                        Doğum Tarihi
                                    </Label>
                                    <Input
                                        id="birthDate"
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                        className="glass-input text-white rounded-xl"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Butonlar */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="flex-1 rounded-xl border-white/10 text-white hover:bg-white/5"
                            disabled={loading}
                        >
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl"
                            disabled={loading}
                        >
                            {loading ? "Ekleniyor..." : "Ekle"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
