import prismadb from "@/lib/prismadb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Activity, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const clientCount = await prismadb.client.count();
  const serviceCount = await prismadb.service.count({
    where: { status: "ACTIVE" },
  });

  // Calculate total income for this month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const payments = await prismadb.payment.findMany({
    where: {
      date: {
        gte: firstDay,
      },
    },
  });
  const totalIncome = payments.reduce((acc, curr) => acc + curr.amount, 0);

  // Calculate pending payments (total service price - paid amount)
  const services = await prismadb.service.findMany({
    where: { status: "ACTIVE" },
    include: { payments: true },
  });

  const pendingPayments = services.reduce((total, service) => {
    const paid = service.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = service.totalPrice - paid;
    return total + (remaining > 0 ? remaining : 0);
  }, 0);

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Panel</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Danışan
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktif Hizmetler
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bu Ay Gelir
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bekleyen Ödemeler
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{pendingPayments.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
