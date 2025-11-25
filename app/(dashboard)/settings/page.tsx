import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUser, deleteUser } from "@/app/actions/user";
import { createServiceType, toggleServiceType, deleteServiceType } from "@/app/actions/servicetype";
import { Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
        redirect("/");
    }

    const users = await prismadb.user.findMany({
        orderBy: { createdAt: "desc" },
    });

    const serviceTypes = await prismadb.serviceType.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="p-8 space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Ayarlar</h2>

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
                    <TabsTrigger value="services">Hizmet Türleri</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Yeni Kullanıcı</CardTitle>
                            <CardDescription>Sisteme yeni kullanıcı ekleyin.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={createUser} className="flex flex-wrap gap-4 items-end">
                                <div className="grid gap-2 w-[180px]">
                                    <Label>Kullanıcı Adı</Label>
                                    <Input name="username" required />
                                </div>
                                <div className="grid gap-2 w-[180px]">
                                    <Label>Şifre</Label>
                                    <Input name="password" type="password" required />
                                </div>
                                <div className="grid gap-2 w-[180px]">
                                    <Label>İsim</Label>
                                    <Input name="name" />
                                </div>
                                <div className="grid gap-2 w-[150px]">
                                    <Label>Rol</Label>
                                    <Select name="role" defaultValue="USER">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USER">Kullanıcı</SelectItem>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit">Ekle</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Kullanıcılar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left font-medium">Kullanıcı Adı</th>
                                            <th className="p-3 text-left font-medium">İsim</th>
                                            <th className="p-3 text-left font-medium">Rol</th>
                                            <th className="p-3 text-right font-medium">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id} className="border-b last:border-0">
                                                <td className="p-3">{user.username}</td>
                                                <td className="p-3">{user.name || "-"}</td>
                                                <td className="p-3">
                                                    <span className={user.role === "ADMIN" ? "text-orange-600 font-medium" : ""}>
                                                        {user.role === "ADMIN" ? "Admin" : "Kullanıcı"}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right">
                                                    {user.username !== "admin" && (
                                                        <form action={deleteUser} className="inline">
                                                            <input type="hidden" name="id" value={user.id} />
                                                            <Button type="submit" variant="ghost" size="sm">
                                                                <Trash className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </form>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="services" className="space-y-4">
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
                                        {serviceTypes.map((service) => (
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
                                                    <form action={toggleServiceType} className="inline mr-2">
                                                        <input type="hidden" name="id" value={service.id} />
                                                        <input type="hidden" name="active" value={(!service.active).toString()} />
                                                        <Button type="submit" variant="outline" size="sm">
                                                            {service.active ? "Pasifleştir" : "Aktifleştir"}
                                                        </Button>
                                                    </form>
                                                    <form action={deleteServiceType} className="inline">
                                                        <input type="hidden" name="id" value={service.id} />
                                                        <Button type="submit" variant="ghost" size="sm">
                                                            <Trash className="h-4 w-4 text-red-500" />
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
                </TabsContent>
            </Tabs>
        </div>
    );
}
