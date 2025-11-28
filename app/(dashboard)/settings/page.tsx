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
import { cn } from "@/lib/utils";

import { Log } from "@prisma/client";

type LogWithUser = Log & {
    user: {
        username: string;
        color: string | null;
    } | null;
};

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
        take: 30,
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
        <div className="p-0 md:p-8 space-y-4 md:space-y-8">
            <h2 className="text-3xl font-bold tracking-tight text-text-heading p-4 md:p-0">Ayarlar</h2>

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList className="card border-0 p-1 mx-4 md:mx-0">
                    <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-white">Kullanıcılar</TabsTrigger>
                    <TabsTrigger value="services" className="data-[state=active]:bg-primary data-[state=active]:text-white">Hizmet Türleri</TabsTrigger>
                    <TabsTrigger value="system" className="data-[state=active]:bg-primary data-[state=active]:text-white">Sistem Kayıtları</TabsTrigger>
                    <TabsTrigger value="backup" className="data-[state=active]:bg-primary data-[state=active]:text-white">Yedekleme</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <Card className="card border-0 mx-4 md:mx-0">
                        <CardHeader>
                            <CardTitle className="text-text-heading">Yeni Kullanıcı</CardTitle>
                            <CardDescription className="text-text-muted">Sisteme yeni kullanıcı ekleyin.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UserForm />
                        </CardContent>
                    </Card>



                    <Card className="md:card border-0 shadow-none bg-transparent md:bg-card">
                        <CardHeader className="px-4 md:px-6">
                            <CardTitle className="text-text-heading">Kullanıcılar</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 md:p-6">
                            <div className="md:rounded-xl md:border md:border-white/10 overflow-hidden">
                                <table className="w-full text-sm text-white">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5">
                                            <th className="p-3 text-left font-medium text-text-muted">Kullanıcı Adı</th>
                                            <th className="p-3 text-left font-medium text-text-muted">İsim</th>
                                            <th className="p-3 text-left font-medium text-text-muted">Rol</th>
                                            <th className="p-3 text-left font-medium text-text-muted">Renk</th>
                                            <th className="p-3 text-right font-medium text-text-muted">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user: { id: number; username: string; name: string | null; role: string }) => (
                                            <tr key={user.id} className="border-b border-white/10 last:border-0 odd:bg-background-card/80 even:bg-background-card/60 hover:bg-white/5">
                                                <td className="p-3 text-text-heading">{user.username}</td>
                                                <td className="p-3 text-text-heading">{user.name || "-"}</td>
                                                <td className="p-3">
                                                    <span className={user.role === "ADMIN" ? "text-warning font-medium" : "text-text-muted"}>
                                                        {user.role === "ADMIN" ? "Admin" : "Kullanıcı"}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full border border-white/20",
                                                        user.role === "ADMIN" ? "bg-orange-500" : "bg-primary"
                                                    )} />
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
                    <Card className="card border-0">
                        <CardHeader>
                            <CardTitle className="text-text-heading">Yeni Hizmet Türü</CardTitle>
                            <CardDescription className="text-text-muted">Sistem genelinde kullanılacak yeni bir hizmet türü ekleyin.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ServiceTypeForm />
                        </CardContent>
                    </Card>



                    <Card className="md:card border-0 shadow-none bg-transparent md:bg-card">
                        <CardHeader className="px-4 md:px-6">
                            <CardTitle className="text-text-heading">Mevcut Hizmet Türleri</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 md:p-6">
                            <div className="md:rounded-md md:border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5">
                                            <th className="p-3 text-left font-medium text-text-muted">Hizmet Adı</th>
                                            <th className="p-3 text-left font-medium text-text-muted">Durum</th>
                                            <th className="p-3 text-right font-medium text-text-muted">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {serviceTypes.map((service: { id: number; name: string; active: boolean }) => (
                                            <tr key={service.id} className="border-b border-white/10 last:border-0 odd:bg-background-card/80 even:bg-background-card/60 hover:bg-white/5">
                                                <td className="p-3 font-medium text-text-heading">{service.name}</td>
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
                    <Card className="card border-0">
                        <CardHeader>
                            <CardTitle className="text-text-heading">Veritabanı Yedeklemesi</CardTitle>
                            <CardDescription className="text-text-muted">Tüm veritabanını JSON formatında indirin ve güvenli bir yere saklayın.</CardDescription>
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
                    <Card className="md:card border-0 shadow-none bg-transparent md:bg-card">

                        <CardHeader className="flex flex-row items-center justify-between px-4 md:px-6">
                            <div>
                                <CardTitle className="text-text-heading">Sistem Kayıtları</CardTitle>
                                <CardDescription className="text-text-muted">Sistemde gerçekleşen önemli olayların kayıtları.</CardDescription>
                            </div>
                            <DownloadLogsButton variant="outline" size="sm" />
                        </CardHeader>
                        <CardContent className="p-0 md:p-6">
                            <div className="md:rounded-xl md:border md:border-white/10 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-text-heading">
                                        <thead>
                                            <tr className="border-b border-white/10 bg-white/5">
                                                <th className="p-3 text-left font-medium text-text-muted">İşlem</th>
                                                <th className="p-3 text-left font-medium text-text-muted">Detaylar</th>
                                                <th className="p-3 text-left font-medium text-text-muted">Kullanıcı</th>
                                                <th className="p-3 text-right font-medium text-text-muted">Tarih</th>
                                                <th className="p-3 text-right font-medium text-text-muted">Geri Al</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs.map((log: LogWithUser) => (
                                                <tr key={log.id} className="border-b border-white/10 last:border-0 odd:bg-background-card/80 even:bg-background-card/60 hover:bg-white/5">
                                                    <td className="p-3 font-medium">{log.action}</td>
                                                    <td className="p-3 text-text-muted">{log.details || "-"}</td>
                                                    <td className="p-3">
                                                        {log.user ? (
                                                            <div className="flex items-center gap-2">
                                                                {log.user.color && (
                                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: log.user.color }} />
                                                                )}
                                                                <span>{log.user.username}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-text-muted">Sistem</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-right text-text-muted">
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
                                                    <td colSpan={5} className="p-4 text-center text-text-muted">
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
