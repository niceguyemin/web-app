import prismadb from "@/lib/prismadb";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ClientServices } from "./components/client-services";
import { ClientPayments } from "./components/client-payments";
import { ClientProfile } from "./components/client-profile";

export default async function ClientDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ tab?: string }>;
}) {
    const { id } = await params;
    const { tab } = await searchParams;
    const defaultTab = tab || "services";

    const [client, serviceTypes] = await Promise.all([
        prismadb.client.findUnique({
            where: { id: parseInt(id) },
            include: {
                services: {
                    orderBy: { createdAt: "desc" },
                    include: { payments: true }
                },
                payments: { orderBy: { date: "desc" } },
                measurements: { orderBy: { date: "desc" } },
            },
        }),
        prismadb.serviceType.findMany({
            where: { active: true },
            orderBy: { name: "asc" },
        }),
    ]);

    if (!client) {
        notFound();
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/clients">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">{client.name}</h2>
            </div>

            <Tabs defaultValue={defaultTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="services">Hizmetler</TabsTrigger>
                    <TabsTrigger value="payments">Ödemeler</TabsTrigger>
                    <TabsTrigger value="profile">Profil & Gelişim</TabsTrigger>
                </TabsList>

                <TabsContent value="services" className="space-y-4">
                    <ClientServices client={client} serviceTypes={serviceTypes} />
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                    <ClientPayments client={client} />
                </TabsContent>

                <TabsContent value="profile" className="space-y-4">
                    <ClientProfile client={client} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
