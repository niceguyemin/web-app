import prismadb from "@/lib/prismadb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
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

export default async function ClientsPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>;
}) {
    const { query = "" } = await searchParams;

    const clients = await prismadb.client.findMany({
        where: {
            name: {
                contains: query,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Danışanlar</h2>
                <Button asChild>
                    <Link href="/clients/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Danışan
                    </Link>
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <form>
                        <Input
                            placeholder="İsim ara..."
                            name="query"
                            className="pl-8"
                            defaultValue={query}
                        />
                    </form>
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ad Soyad</TableHead>
                            <TableHead>Telefon</TableHead>
                            <TableHead>Cinsiyet</TableHead>
                            <TableHead>Kayıt Tarihi</TableHead>
                            <TableHead className="text-right">İşlem</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    Danışan bulunamadı.
                                </TableCell>
                            </TableRow>
                        )}
                        {clients.map((client) => (
                            <TableRow key={client.id}>
                                <TableCell className="font-medium">{client.name}</TableCell>
                                <TableCell>{client.phone || "-"}</TableCell>
                                <TableCell>{client.gender || "-"}</TableCell>
                                <TableCell>
                                    {format(client.createdAt, "d MMMM yyyy", { locale: tr })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" asChild>
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
