import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "@/components/settings/user-form";
import { DeleteUserButton } from "@/components/settings/delete-user-button";
import { ServiceTypeForm } from "@/components/settings/service-type-form";
import { ServiceTypeActions } from "@/components/settings/service-type-actions";
import { Badge } from "@/components/ui/badge";
import { DownloadBackupButton } from "@/components/download-backup-button";
import { UploadBackupButton } from "@/components/upload-backup-button";
import { DownloadLogsButton } from "@/components/download-logs-button";
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
                            <UserForm />
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
                                                        <DeleteUserButton userId={user.id} />
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
                            <ServiceTypeForm />
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
                                                    <ServiceTypeActions serviceId={service.id} isActive={service.active} />
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
                                <div className="overflow-x-auto">
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
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
