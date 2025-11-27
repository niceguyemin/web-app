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
import { DownloadBackupButton } from "@/components/download-backup-button";
import { UploadBackupButton } from "@/components/upload-backup-button";
import { DownloadLogsButton } from "@/components/download-logs-button";
import { undoLog } from "@/app/actions/log";
import { RotateCcw } from "lucide-react";
import { UndoButton } from "@/components/undo-button";

export default async function SettingsPage() {
    const session = await auth();

    if ((session?.user as any)?.role !== "ADMIN") {
        redirect("/");
    }

    const users = await prismadb.user.findMany({
        orderBy: { createdAt: "desc" },
    });

    const serviceTypes = await prismadb.serviceType.findMany({
        orderBy: { createdAt: "desc" },
    });

    const logs = await prismadb.log.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: {
                    username: true,
                    color: true,
                }
            }
        }
    });

    return (
        <div className="p-8 space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Ayarlar</h2>

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
                    <TabsTrigger value="services">Hizmet Türleri</TabsTrigger>
                    <TabsTrigger value="system">Sistem Kayıtları</TabsTrigger>
                    <TabsTrigger value="backup">Yedekleme</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <Card className="glass-card border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Yeni Kullanıcı</CardTitle>
                            <CardDescription className="text-white/50">Sisteme yeni kullanıcı ekleyin.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={createUser} className="flex flex-wrap gap-4 items-end">
                                <div className="grid gap-2 w-[180px]">
                                    <Label className="text-white/70">Kullanıcı Adı</Label>
                                    <Input name="username" required className="glass-input text-white rounded-xl border-white/10" />
                                </div>
                                <div className="grid gap-2 w-[180px]">
                                    <Label className="text-white/70">Şifre</Label>
                                    <Input name="password" type="password" required className="glass-input text-white rounded-xl border-white/10" />
                                </div>
                                <div className="grid gap-2 w-[180px]">
                                    <Label className="text-white/70">İsim</Label>
                                    <Input name="name" className="glass-input text-white rounded-xl border-white/10" />
                                </div>
                                <div className="grid gap-2 w-[150px]">
                                    <Label className="text-white/70">Rol</Label>
                                    <Select name="role" defaultValue="USER">
                                        <SelectTrigger className="glass-input text-white rounded-xl border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1b4b] border-white/10 text-white">
                                            <SelectItem value="USER">Kullanıcı</SelectItem>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2 w-[150px]">
                                    <Label className="text-white/70">Renk</Label>
                                    <Select name="color" defaultValue="#F97316">
                                        <SelectTrigger className="glass-input text-white rounded-xl border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1b4b] border-white/10 text-white">
                                            <SelectItem value="#F97316">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-orange-500" />
                                                    <span>Turuncu</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="#3B82F6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-blue-500" />
                                                    <span>Mavi</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="#22C55E">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-green-500" />
                                                    <span>Yeşil</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="#A855F7">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-purple-500" />
                                                    <span>Mor</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="#EC4899">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-pink-500" />
                                                    <span>Pembe</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="#06B6D4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-cyan-500" />
                                                    <span>Turkuaz</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-xl">Ekle</Button>
                            </form>
                        </CardContent>
                    </Card>



                    <Card className="glass-card border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Kullanıcılar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border border-white/10 overflow-hidden">
                                <table className="w-full text-sm text-white">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5">
                                            <th className="p-3 text-left font-medium">Kullanıcı Adı</th>
                                            <th className="p-3 text-left font-medium">İsim</th>
                                            <th className="p-3 text-left font-medium">Rol</th>
                                            <th className="p-3 text-left font-medium">Renk</th>
                                            <th className="p-3 text-right font-medium">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id} className="border-b border-white/10 last:border-0 hover:bg-white/5">
                                                <td className="p-3">{user.username}</td>
                                                <td className="p-3">{user.name || "-"}</td>
                                                <td className="p-3">
                                                    <span className={user.role === "ADMIN" ? "text-orange-400 font-medium" : "text-white/70"}>
                                                        {user.role === "ADMIN" ? "Admin" : "Kullanıcı"}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    {user.color && (
                                                        <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: user.color }} />
                                                    )}
                                                </td>
                                                <td className="p-3 text-right">
                                                    {user.username !== "admin" && (
                                                        <form action={deleteUser} className="inline">
                                                            <input type="hidden" name="id" value={user.id} />
                                                            <Button type="submit" variant="ghost" size="sm" className="hover:bg-red-500/20 hover:text-red-400 rounded-lg">
                                                                <Trash className="h-4 w-4" />
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

                <TabsContent value="backup" className="space-y-4">
                    <Card className="glass-card border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Veritabanı Yedeklemesi</CardTitle>
                            <CardDescription className="text-white/50">Tüm veritabanını JSON formatında indirin ve güvenli bir yere saklayın.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                    <p className="text-sm text-blue-200">
                                        ℹ️ Yedekleme işlemi tüm danışanlar, randevular, ödemeler, giderler, ölçümler ve sistem kayıtlarını içerir.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <DownloadBackupButton variant="default" />
                                    <UploadBackupButton variant="secondary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="system" className="space-y-4">
                    <Card className="glass-card border-white/10">

                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-white">Sistem Kayıtları</CardTitle>
                                <CardDescription className="text-white/50">Sistemde gerçekleşen önemli olayların kayıtları.</CardDescription>
                            </div>
                            <DownloadLogsButton variant="outline" size="sm" />
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border border-white/10 overflow-hidden">
                                <table className="w-full text-sm text-white">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5">
                                            <th className="p-3 text-left font-medium">İşlem</th>
                                            <th className="p-3 text-left font-medium">Detaylar</th>
                                            <th className="p-3 text-left font-medium">Kullanıcı</th>
                                            <th className="p-3 text-right font-medium">Tarih</th>
                                            <th className="p-3 text-right font-medium">Geri Al</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log) => (
                                            <tr key={log.id} className="border-b border-white/10 last:border-0 hover:bg-white/5">
                                                <td className="p-3 font-medium">{log.action}</td>
                                                <td className="p-3 text-white/70">{log.details || "-"}</td>
                                                <td className="p-3">
                                                    {log.user ? (
                                                        <div className="flex items-center gap-2">
                                                            {log.user.color && (
                                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: log.user.color }} />
                                                            )}
                                                            <span>{log.user.username}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-white/30">Sistem</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right text-white/50">
                                                    {new Date(log.createdAt).toLocaleString("tr-TR")}
                                                </td>
                                                <td className="p-3 text-right">
                                                    {log.isUndone ? (
                                                        <Badge variant="secondary" className="bg-red-500/10 text-red-400 hover:bg-red-500/20">
                                                            Geri Alındı
                                                        </Badge>
                                                    ) : log.relatedId && log.relatedTable ? (
                                                        <UndoButton logId={log.id} />
                                                    ) : (
                                                        <span className="text-white/30 text-xs">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {logs.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-4 text-center text-white/50">
                                                    Henüz kayıt bulunmuyor.
                                                </td>
                                            </tr>
                                        )}
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
