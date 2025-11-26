"use client";

import { Client, Measurement } from "@prisma/client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addMeasurement } from "@/app/actions/measurement";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { EditClientDialog } from "./edit-client-dialog";

import { formatPhoneNumber } from "@/lib/utils";

interface ClientProfileProps {
    client: Client & {
        measurements: Measurement[];
    };
}

export function ClientProfile({ client }: ClientProfileProps) {
    const chartData = [...client.measurements]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((m) => ({
            date: format(m.date, "d MMM", { locale: tr }),
            weight: m.weight,
        }));

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Profil Bilgileri</CardTitle>
                    <EditClientDialog client={client} />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Telefon</Label>
                            <p className="font-medium">
                                <a href={`tel:${client.phone}`} className="hover:text-primary transition-colors">
                                    {formatPhoneNumber(client.phone)}
                                </a>
                            </p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Cinsiyet</Label>
                            <p className="font-medium">{client.gender || "-"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Doğum Tarihi</Label>
                            <p className="font-medium">{client.birthDate || "-"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Son Kilo</Label>
                            <p className="font-medium">{client.weight ? `${client.weight} kg` : "-"}</p>
                        </div>
                    </div>
                    <div>
                        <Label className="text-muted-foreground">Notlar</Label>
                        <p className="text-sm mt-1">{client.notes || "Not yok."}</p>
                    </div>

                    <div className="pt-4 border-t">
                        <form action={async (formData) => {
                            if (confirm(`${client.name} adlı danışanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm ilişkili veriler (hizmetler, ödemeler, ölçümler) silinecektir.`)) {
                                const { deleteClient } = await import("@/app/actions/client");
                                await deleteClient(formData);
                            }
                        }}>
                            <input type="hidden" name="id" value={client.id} />
                            <Button type="submit" variant="destructive" className="w-full">
                                Danışanı Sil
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Kilo Takibi</CardTitle>
                    <CardDescription>Yeni ölçüm ekle ve grafiği gör.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form action={addMeasurement} className="flex gap-4 items-end">
                        <input type="hidden" name="clientId" value={client.id} />
                        <input type="hidden" name="height" value={client.height || ""} />
                        <div className="grid gap-2 flex-1">
                            <Label>Kilo (kg)</Label>
                            <Input name="weight" type="number" step="0.1" required />
                        </div>
                        <Button type="submit">Ekle</Button>
                    </form>

                    <div className="h-[200px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" fontSize={12} />
                                    <YAxis domain={['auto', 'auto']} fontSize={12} />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="weight"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                Grafik için veri yok.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
