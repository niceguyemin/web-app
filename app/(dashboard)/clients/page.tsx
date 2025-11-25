import prismadb from "@/lib/prismadb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { Search } from "@/components/search";

export default async function ClientsPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>;
}) {
    const { query = "" } = await searchParams;

    const clients = await prismadb.client.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { phone: { contains: query } },
            ],
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-white">Danışanlar</h2>
                <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl">
                    <Link href="/clients/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Danışan
                    </Link>
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <Search placeholder="İsim veya telefon ara..." />
            </div>

            <div className="rounded-xl border border-white/10 glass-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5 hover:bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-white/70">Ad Soyad</TableHead>
                            <TableHead className="text-white/70">Telefon</TableHead>
                            <TableHead className="text-white/70">Cinsiyet</TableHead>
                            <TableHead className="text-white/70">Kayıt Tarihi</TableHead>
                            <TableHead className="text-right text-white/70">İşlem</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.length === 0 && (
                            <TableRow className="border-white/10 hover:bg-white/5">
                                <TableCell colSpan={5} className="text-center h-24 text-white/50">
                                    Danışan bulunamadı.
                                </TableCell>
                            </TableRow>
                        )}
                        {clients.map((client) => (
                            <TableRow key={client.id} className="border-white/10 hover:bg-white/5 transition-colors">
                                <TableCell className="font-medium text-white">{client.name}</TableCell>
                                <TableCell className="text-white/70">{client.phone || "-"}</TableCell>
                                <TableCell className="text-white/70">{client.gender || "-"}</TableCell>
                                <TableCell className="text-white/70">
                                    {format(client.createdAt, "d MMMM yyyy", { locale: tr })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/10 rounded-lg">
                                        <Link href={`/clients/${client.id}`}>
                                            Detay
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
