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

import { formatPhoneNumber } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

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
        include: {
            services: {
                where: { status: "ACTIVE" },
                orderBy: { createdAt: "desc" }
            },
            payments: true
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="p-4 md:p-8 space-y-4 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Danışanlar</h2>
                <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl w-full sm:w-auto">
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
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-white/5 hover:bg-white/5">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-white/70">Ad Soyad</TableHead>
                                <TableHead className="text-white/70">Telefon</TableHead>
                                <TableHead className="text-white/70 hidden md:table-cell">Aktif Hizmetler</TableHead>
                                <TableHead className="text-white/70 hidden md:table-cell">Kalan Borç</TableHead>
                                <TableHead className="text-right text-white/70">İşlemler</TableHead>
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
                            {clients.map((client) => {
                                const activeServices = client.services;
                                const totalDebt = client.services.reduce((acc, s) => acc + (s.totalPrice || 0), 0);
                                const totalPaid = client.payments.reduce((acc, p) => acc + p.amount, 0);
                                const remainingDebt = totalDebt - totalPaid;

                                return (
                                    <TableRow key={client.id} className="border-white/10 hover:bg-white/5 transition-colors">
                                        <TableCell className="font-medium text-white">
                                            <Link href={`/clients/${client.id}`} className="hover:underline">
                                                {client.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-white/70">
                                            <a href={`tel:${client.phone}`} className="hover:text-primary transition-colors">
                                                {formatPhoneNumber(client.phone)}
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-white/70 hidden md:table-cell">
                                            <div className="flex flex-wrap gap-1">
                                                {activeServices.length > 0 ? (
                                                    <>
                                                        {activeServices.slice(0, 2).map((service) => (
                                                            <span key={service.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20 whitespace-nowrap">
                                                                {service.type}
                                                            </span>
                                                        ))}
                                                        {activeServices.length > 2 && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 text-white/50 border border-white/10 cursor-help">
                                                                            +{activeServices.length - 2}
                                                                        </span>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="bg-[#0f1021] border-white/10 text-white">
                                                                        <div className="flex flex-col gap-1">
                                                                            {activeServices.slice(2).map((service) => (
                                                                                <span key={service.id} className="text-xs">
                                                                                    {service.type}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-white/30">-</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-white/70 hidden md:table-cell">
                                            {remainingDebt > 0 ? (
                                                <span className="text-red-400 font-medium">{remainingDebt} ₺</span>
                                            ) : (
                                                <span className="text-green-500 font-medium">Ödendi</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex flex-col md:flex-row justify-end gap-1 md:gap-2">
                                                <Button variant="outline" size="sm" asChild className="bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 rounded-lg h-7 md:h-8 text-[10px] md:text-xs whitespace-nowrap">
                                                    <Link href={`/clients/${client.id}?tab=services`}>
                                                        Hizmetler
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" size="sm" asChild className="bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20 hover:text-green-300 rounded-lg h-7 md:h-8 text-[10px] md:text-xs whitespace-nowrap">
                                                    <Link href={`/clients/${client.id}?tab=payments`}>
                                                        Ödemeler
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
