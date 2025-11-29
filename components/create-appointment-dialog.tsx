"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/responsive-dialog";
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
    clients: {
        id: number;
        name: string;
        services: {
            id: number;
            type: string;
            remainingSessions: number;
        }[];
    }[];
    users: Partial<User>[];
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

    const [successData, setSuccessData] = useState<{ clientName: string; phone: string; date: string; time: string } | null>(null);

    // Fetch fresh clients when dialog opens
    useEffect(() => {
        if (open) {
            import("@/app/actions/client").then(({ getClients }) => {
                getClients().then(setClientsList);
            });
            setSuccessData(null); // Reset success state
        }
    }, [open]);

    const selectedClient = clientsList.find((c) => c.id.toString() === selectedClientId);

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

    if (successData) {
        return (
            <ResponsiveDialog
                open={open}
                onOpenChange={setOpen}
                title="Randevu Oluşturuldu"
                trigger={
                    <Button className="btn-primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Randevu
                    </Button>
                }
                className="sm:max-w-[425px] overflow-visible"
                footer={
                    <div className="flex flex-col w-full gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="w-full glass-button"
                            size="touch"
                        >
                            Kapat
                        </Button>
                    </div>
                }
            >
                <div className="flex flex-col items-center justify-center py-6 space-y-6">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold text-white">Başarılı!</h3>
                        <p className="text-white/70">
                            {successData.clientName} için randevu oluşturuldu.
                        </p>
                        <p className="text-white/50 text-sm">
                            {successData.date} - {successData.time}
                        </p>
                    </div>
                </div>
            </ResponsiveDialog>
        );
    }

    return (
        <ResponsiveDialog
            open={open}
            onOpenChange={setOpen}
            title="Randevu Oluştur"
            trigger={
                <Button className="btn-primary">
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Randevu
                </Button>
            }
            className="sm:max-w-[425px] overflow-visible"
            footer={
                <Button
                    type="submit"
                    form="create-appointment-form"
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl"
                    size="touch"
                >
                    Oluştur
                </Button>
            }
        >
            <form
                id="create-appointment-form"
                action={async (formData) => {
                    try {
                        setError(null);
                        await createAppointment(formData);

                        // Set success data instead of closing
                        if (selectedClient && date) {
                            const time = formData.get("time") as string;
                            setSuccessData({
                                clientName: selectedClient.name,
                                phone: (selectedClient as any).phone || "", // Assuming phone exists on client
                                date: format(date, "d MMMM yyyy", { locale: tr }),
                                time: time
                            });
                        } else {
                            // Fallback if something is missing, though validation should prevent this
                            setOpen(false);
                        }

                        toast.success("Randevu başarıyla oluşturuldu");

                        // Clear form state
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
                            placeholder="Danışan ara (Örn: Ali Yılmaz, 0555...)"
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
                        <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full bg-popover/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-[9999] max-h-[240px] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
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
                        <SelectContent className="bg-popover border-white/10 text-popover-foreground">
                            {users.map((user) => {
                                if (!user.id) return null;
                                return (
                                    <SelectItem
                                        key={user.id}
                                        value={user.id.toString()}
                                        className="focus:bg-primary/20 focus:text-primary"
                                    >
                                        <div className="flex items-center gap-2">
                                            {user.color && (
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: user.color }} />
                                            )}
                                            {user.name || user.username}
                                        </div>
                                    </SelectItem>
                                );
                            })}
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
                            <SelectContent className="bg-popover border-white/10 text-popover-foreground">
                                {selectedClient.services.map((service) => (
                                    <SelectItem
                                        key={service.id}
                                        value={service.id.toString()}
                                        disabled={service.remainingSessions <= 0}
                                        className="focus:bg-primary/20 focus:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <PopoverContent className="w-auto p-0 bg-popover border-white/10 text-popover-foreground" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    locale={tr}
                                    className="bg-transparent text-popover-foreground"
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
                        <Input
                            type="text"
                            name="time"
                            placeholder="09:00"
                            required
                            maxLength={5}
                            className="glass-input text-white rounded-xl border-white/10"
                            onBlur={(e) => {
                                let value = e.target.value.replace(/[^0-9]/g, '');

                                // Auto-format 3 digits to HH:0M (e.g. 930 -> 09:30)
                                if (value.length === 3) {
                                    value = "0" + value;
                                }

                                if (value.length >= 4) {
                                    let hours = parseInt(value.slice(0, 2));
                                    let minutes = parseInt(value.slice(2, 4));

                                    // Validate Hours (00-23)
                                    if (hours > 23) hours = 23;

                                    // Validate Minutes (00-59)
                                    if (minutes > 59) minutes = 59;

                                    // Format back to HH:MM
                                    const formattedHours = hours.toString().padStart(2, '0');
                                    const formattedMinutes = minutes.toString().padStart(2, '0');

                                    e.target.value = `${formattedHours}:${formattedMinutes}`;
                                } else if (value.length > 0) {
                                    // If incomplete but has some numbers, try to fix or clear
                                    // For now, let's clear if it's garbage to avoid errors
                                    // or maybe just leave it for the user to fix, but the regex above cleaned it.
                                    // Let's just ensure it has a colon if it's 2 digits? No, 2 digits is ambiguous.
                                }
                            }}
                            onChange={(e) => {
                                // Allow only numbers and colon
                                let value = e.target.value;
                                if (value.length === 2 && !value.includes(':') && e.nativeEvent instanceof InputEvent && (e.nativeEvent as InputEvent).inputType !== 'deleteContentBackward') {
                                    // Auto-add colon after 2 digits if typing forward
                                    value = value + ':';
                                }
                                e.target.value = value;
                            }}
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
            </form>
        </ResponsiveDialog>
    );
}
