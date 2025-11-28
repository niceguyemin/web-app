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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { Search } from "@/components/search";
import { formatPhoneNumber } from "@/lib/utils";
import { CreateClientDialog } from "./components/create-client-dialog";

export default async function ClientsPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>;
}) {
    const { query = "" } = await searchParams;

    const clients = await prismadb.client.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: "insensitive" } },
                { phone: { contains: query } },
            ],
        },
        include: {
            services: {
                where: { status: "ACTIVE" },
                orderBy: { createdAt: "desc" },
                include: {
                    payments: true,
                },
            },
            payments: true
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const serviceTypes = await prismadb.serviceType.findMany({
        where: {
            active: true,
        },
        orderBy: {
            name: "asc",
        },
    });

    return (
        <div className="p-4 md:p-8 space-y-4 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-heading">Danışanlar</h2>
                <CreateClientDialog serviceTypes={serviceTypes} />
            </div>

            <div className="flex items-center space-x-2">
                <Search placeholder="İsim veya telefon ara..." />
            </div>

            <div className="rounded-xl border border-white/10 card overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-text-muted">Ad Soyad</TableHead>
                                <TableHead className="text-text-muted">Telefon</TableHead>
                                <TableHead className="text-text-muted hidden md:table-cell">Aktif Hizmetler</TableHead>
                                <TableHead className="text-text-muted hidden md:table-cell">Kalan Borç</TableHead>
                                <TableHead className="text-right text-text-muted">İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.length === 0 && (
                                <TableRow className="border-white/10 hover:bg-white/5">
                                    <TableCell colSpan={5} className="text-center h-24 text-text-muted">
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
                                    <TableRow key={client.id} className="border-white/10 odd:bg-background-card/80 even:bg-background-card/60 hover:bg-white/5 transition-colors">
                                        <TableCell className="font-medium text-text-heading max-w-[150px] md:max-w-none">
                                            <Link href={`/clients/${client.id}`} className="hover:text-primary transition-colors break-words">
                                                {client.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-text-muted">
                                            <a href={`tel:${client.phone}`} className="hover:text-primary transition-colors">
                                                {formatPhoneNumber(client.phone)}
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-text-muted hidden md:table-cell">
                                            <div className="flex flex-wrap gap-1">
                                                {activeServices.length > 0 ? (
                                                    <>
                                                        {activeServices.slice(0, 2).map((service) => (
                                                            <span key={service.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-background-dark text-primary border border-primary/20 whitespace-nowrap">
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
                                                                    <TooltipContent className="bg-black/80 backdrop-blur-xl border-white/10 text-white">
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
                                                <span className="text-error font-medium">{remainingDebt} ₺</span>
                                            ) : (
                                                <span className="text-secondary font-medium">Ödendi</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex flex-col md:flex-row justify-end gap-1 md:gap-2">
                                                <Button variant="outline" size="sm" asChild className="h-7 md:h-8 text-[10px] md:text-xs whitespace-nowrap border-white/10 bg-transparent text-text-muted hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all">
                                                    <Link href={`/clients/${client.id}?tab=services`}>
                                                        Hizmetler
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" size="sm" asChild className="h-7 md:h-8 text-[10px] md:text-xs whitespace-nowrap border-white/10 bg-transparent text-text-muted hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all">
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
