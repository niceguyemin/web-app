"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
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
import { Plus, Search, X, CalendarIcon, User as UserIcon, Check } from "lucide-react";
import { Client, Service, User } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface CreateAppointmentDialogProps {
    clients: (Client & { services: Service[] })[];
    users: User[];
}

export function CreateAppointmentDialog({ clients, users }: CreateAppointmentDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [date, setDate] = useState<Date>();

    const [clientsList, setClientsList] = useState(clients);

    // Fetch fresh clients when dialog opens
    useEffect(() => {
        if (open) {
            import("@/app/actions/client").then(({ getClients }) => {
                getClients().then(setClientsList);
            });
        }
    }, [open]);

    const selectedClient = clientsList.find((c) => c.id.toString() === selectedClientId);

    // Generate time slots (09:00 to 19:00, 15 min intervals)
    const timeSlots = useMemo(() => {
        const slots = [];
        for (let i = 9; i < 19; i++) {
            slots.push(`${i.toString().padStart(2, '0')}:00`);
            slots.push(`${i.toString().padStart(2, '0')}:15`);
            slots.push(`${i.toString().padStart(2, '0')}:30`);
            slots.push(`${i.toString().padStart(2, '0')}:45`);
        }
        return slots;
    }, []);

    // Filter clients based on search term
    const filteredClients = useMemo(() => {
        if (!searchTerm) return clientsList;
        return clientsList.filter(client =>
            client.name.toLocaleLowerCase('tr').includes(searchTerm.toLocaleLowerCase('tr'))
        );
    }, [clientsList, searchTerm]);

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
            const client = clientsList.find(c => c.id.toString() === selectedClientId);
            if (client) {
                setSearchTerm(client.name);
            }
        } else {
            setSearchTerm("");
        }
    }, [selectedClientId, clientsList]);

    const handleSelectClient = (client: typeof clients[0]) => {
        setSelectedClientId(client.id.toString());
        setSearchTerm(client.name);
        setIsDropdownOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="btn-primary">
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Randevu
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-white/10 text-white sm:max-w-[425px] overflow-visible">
                <DialogHeader>
                    <DialogTitle className="text-white">Randevu Oluştur</DialogTitle>
                </DialogHeader>
                <form
                    action={async (formData) => {
                        try {
                            setError(null);
                            await createAppointment(formData);
                            toast.success("Randevu başarıyla oluşturuldu");
                            setOpen(false);
                            setSelectedClientId("");
                            setSearchTerm("");
                            setDate(undefined);
                        } catch (err) {
                            setError(err instanceof Error ? err.message : "Bir hata oluştu");
                        }
                    }}
                    className="space-y-4"
                >
                    <div className="grid gap-2 relative" ref={dropdownRef}>
                        <Label className="text-white/70">Danışan</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                            <Input
                                type="text"
                                placeholder="Danışan ara..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setIsDropdownOpen(true);
                                    if (selectedClientId) setSelectedClientId("");
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                className="pl-9 glass-input text-white rounded-xl border-white/10"
                                autoComplete="off"
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
                            <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full bg-[#1a1b4b]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-[9999] max-h-[240px] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                                {filteredClients.length > 0 ? (
                                    <ul className="p-1">
                                        {filteredClients.map((client) => (
                                            <li
                                                key={client.id}
                                                onClick={() => handleSelectClient(client)}
                                                className={cn(
                                                    "group flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-lg transition-all duration-200",
                                                    "hover:bg-white/10 text-white/70 hover:text-white",
                                                    selectedClientId === client.id.toString() && "bg-primary/20 text-white hover:bg-primary/30"
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
                                                    selectedClientId === client.id.toString() ? "bg-primary/20 text-primary" : "bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white"
                                                )}>
                                                    <UserIcon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 flex flex-col">
                                                    <span className="font-medium">{client.name}</span>
                                                    {client.services.length > 0 && (
                                                        <span className="text-xs text-white/40">
                                                            {client.services.length} Aktif Hizmet
                                                        </span>
                                                    )}
                                                </div>
                                                {selectedClientId === client.id.toString() && (
                                                    <Check className="h-4 w-4 text-primary" />
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-6 text-center text-sm text-white/40 flex flex-col items-center gap-2">
                                        <Search className="h-8 w-8 opacity-20" />
                                        <span>Danışan bulunamadı.</span>
                                    </div>
                                )}
                            </div>
                        )}
                        <input type="hidden" name="clientId" value={selectedClientId} />
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
                                            disabled={service.remainingSessions <= 0}
                                            className="focus:bg-white/10 focus:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal glass-input text-white rounded-xl border-white/10 hover:bg-white/5 hover:text-white",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "d MMMM yyyy", { locale: tr }) : <span>Tarih seçin</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-[#1a1b4b] border-white/10 text-white" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        locale={tr}
                                        className="bg-[#1a1b4b] text-white"
                                        classNames={{
                                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                            day_today: "bg-white/10 text-white",
                                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white",
                                            day_outside: "text-white/30 opacity-50",
                                            day_disabled: "text-white/30 opacity-50",
                                            head_cell: "text-white/50 rounded-md w-9 font-normal text-[0.8rem]",
                                            caption: "flex justify-center pt-1 relative items-center text-white",
                                            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white hover:bg-white/10",
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            <input type="hidden" name="date" value={date ? format(date, "yyyy-MM-dd") : ""} />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-white/70">Saat</Label>
                            <Select name="time" required>
                                <SelectTrigger className="glass-input text-white rounded-xl border-white/10">
                                    <SelectValue placeholder="Saat seçin" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1b4b] border-white/10 text-white max-h-[200px]">
                                    {timeSlots.map((time) => (
                                        <SelectItem key={time} value={time} className="focus:bg-white/10 focus:text-white">
                                            {time}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
