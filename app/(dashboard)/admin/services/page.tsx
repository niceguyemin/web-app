import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceType, toggleServiceType } from "@/app/actions/servicetype";
import { Badge } from "@/components/ui/badge";

export default async function ServiceTypesPage() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        redirect("/");
    }

    const serviceTypes = await prismadb.serviceType.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="p-8 space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Hizmet Türleri</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Yeni Hizmet Türü</CardTitle>
                    <CardDescription>Sistem genelinde kullanılacak yeni bir hizmet türü ekleyin.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createServiceType} className="flex gap-4 items-end">
                        <div className="grid gap-2 flex-1 max-w-sm">
                            <Label>Hizmet Adı</Label>
                            <Input name="name" placeholder="Örn: Masaj Terapisi" required />
                        </div>
                        <Button type="submit">Ekle</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Mevcut Hizmet Türleri</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="p-3 text-left font-medium">Hizmet Adı</th>
                                    <th className="p-3 text-left font-medium">Durum</th>
                                    <th className="p-3 text-right font-medium">İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {serviceTypes.map((service: { id: number; name: string; active: boolean }) => (
                                    <tr key={service.id} className="border-b last:border-0">
                                        <td className="p-3 font-medium">{service.name}</td>
                                        <td className="p-3">
                                            {service.active ? (
                                                <Badge variant="default">Aktif</Badge>
                                            ) : (
                                                <Badge variant="secondary">Pasif</Badge>
                                            )}
                                        </td>
                                        <td className="p-3 text-right">
                                            <form action={toggleServiceType} className="inline">
                                                <input type="hidden" name="id" value={service.id} />
                                                <input type="hidden" name="active" value={(!service.active).toString()} />
                                                <Button type="submit" variant="outline" size="sm">
                                                    {service.active ? "Pasifleştir" : "Aktifleştir"}
                                                </Button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
