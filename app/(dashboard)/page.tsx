export const dynamic = "force-dynamic";

import prismadb from "@/lib/prismadb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, CreditCard, Activity, DollarSign } from "lucide-react";
import { Overview } from "@/components/overview";
import { RecentSales } from "@/components/recent-sales";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { tr } from "date-fns/locale";

export default async function Page() {
  const clientCount = await prismadb.client.count();
  const serviceCount = await prismadb.service.count({
    where: { status: "ACTIVE" },
  });

  const now = new Date();
  const firstDayOfMonth = startOfMonth(now);

  // This month's income
  const thisMonthPayments = await prismadb.payment.findMany({
    where: {
      date: {
        gte: firstDayOfMonth,
      },
    },
  });
  const totalIncome = thisMonthPayments.reduce((acc, curr) => acc + curr.amount, 0);

  // Pending payments
  const services = await prismadb.service.findMany({
    where: { status: "ACTIVE" },
    include: { payments: true },
  });

  const pendingPayments = services.reduce((total, service) => {
    const paid = service.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = service.totalPrice - paid;
    return total + (remaining > 0 ? remaining : 0);
  }, 0);

  // Recent Sales (Last 5 payments)
  const recentPayments = await prismadb.payment.findMany({
    take: 5,
    orderBy: {
      date: "desc",
    },
    include: {
      client: {
        select: {
          name: true,
        },
      },
    },
  });

  // Graph Revenue (Last 6 months)
  const graphData = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(now, i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    const monthlyPayments = await prismadb.payment.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    const total = monthlyPayments.reduce((acc, curr) => acc + curr.amount, 0);
    graphData.push({
      name: format(date, "MMM", { locale: tr }),
      total: total,
    });
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Panel</h2>
      </div>

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
            <p className="text-xs text-muted-foreground">
              Sisteme kayıtlı toplam kişi
            </p>
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
            <p className="text-xs text-muted-foreground">
              Devam eden paket sayısı
            </p>
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
            <div className="text-2xl font-bold">
              ₺{totalIncome.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(now, "MMMM", { locale: tr })} ayı toplamı
            </p>
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
            <div className="text-2xl font-bold">
              ₺{pendingPayments.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tahsil edilecek tutar
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Genel Bakış</CardTitle>
            <CardDescription>
              Son 6 aylık gelir grafiği
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={graphData} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Son İşlemler</CardTitle>
            <CardDescription>
              Son yapılan 5 ödeme işlemi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales payments={recentPayments} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
