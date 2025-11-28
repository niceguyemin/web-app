export const dynamic = "force-dynamic";

import prismadb from "@/lib/prismadb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar, Activity, Clock, UserPlus } from "lucide-react";
import { TodayAppointments } from "@/components/today-appointments";
import { RecentClients } from "@/components/recent-clients";
import { QuickAddClient } from "@/components/quick-add-client";
import { QuickAddPayment } from "@/components/quick-add-payment";
import { startOfDay, endOfDay, addDays, startOfMonth } from "date-fns";
import { DateTimeDisplay } from "@/components/date-time-display";

import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  const user = session?.user;
  const name = user?.name || "Kullanıcı";

  const formatter = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "numeric",
    hour12: false,
  });
  const hour = parseInt(formatter.format(new Date()));

  let greeting = "";
  if (hour >= 5 && hour < 12) {
    greeting = "Günaydın";
  } else if (hour >= 12 && hour < 18) {
    greeting = "İyi Günler";
  } else if (hour >= 18 && hour < 22) {
    greeting = "İyi Akşamlar";
  } else {
    greeting = "İyi Geceler";
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const nextWeekEnd = endOfDay(addDays(now, 7));
  const monthStart = startOfMonth(now);

  // 1. Toplam Danışan
  const clientCount = await prismadb.client.count();

  // 2. Aktif Hizmetler
  const serviceCount = await prismadb.service.count({
    where: { status: "ACTIVE" },
  });

  // 3. Bugünkü Randevular
  const todayAppointments = await prismadb.appointment.findMany({
    where: {
      date: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    include: {
      client: true,
      service: true,
      user: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  // 4. Gelecek Randevular (Önümüzdeki 7 gün)
  const upcomingAppointmentsCount = await prismadb.appointment.count({
    where: {
      date: {
        gt: todayEnd,
        lte: nextWeekEnd,
      },
      status: {
        not: "CANCELLED",
      },
    },
  });

  // 5. Son Eklenen Danışanlar
  const recentClients = await prismadb.client.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      phone: true,
    },
  });

  // 6. Hizmet Türleri (Hızlı Ekle için)
  const serviceTypes = await prismadb.serviceType.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  // 7. Tüm Danışanlar (Hızlı Ödeme için)
  const allClients = await prismadb.client.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      services: {
        where: { status: "ACTIVE" },
        select: {
          id: true,
          type: true,
          totalPrice: true,
          payments: {
            select: { amount: true }
          }
        }
      }
    },
  });

  // 8. Bu Ay Eklenen Danışanlar
  const newClientsCount = await prismadb.client.count({
    where: {
      createdAt: {
        gte: monthStart,
      },
    },
  });

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-heading">
            {greeting}, {name}
          </h2>
          <div className="flex items-center gap-2">
            <QuickAddPayment clients={allClients} />
            <QuickAddClient serviceTypes={serviceTypes} />
          </div>
        </div>
        <DateTimeDisplay />
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-2 px-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-text-muted">
              Bugünkü Randevular
            </CardTitle>
            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 py-1 md:p-6 md:pt-0">
            <div className="text-xl md:text-2xl font-bold text-text-heading">{todayAppointments.length}</div>
            <p className="text-[10px] md:text-xs text-text-muted">
              Günün yoğunluğu
            </p>
          </CardContent>
        </Card>

        <Card className="card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-2 px-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-text-muted">
              Gelecek Randevular
            </CardTitle>
            <Clock className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 py-1 md:p-6 md:pt-0">
            <div className="text-xl md:text-2xl font-bold text-text-heading">{upcomingAppointmentsCount}</div>
            <p className="text-[10px] md:text-xs text-text-muted">
              Önümüzdeki 7 gün
            </p>
          </CardContent>
        </Card>

        <Card className="card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-2 px-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-text-muted">
              Toplam Danışan
            </CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 py-1 md:p-6 md:pt-0">
            <div className="text-xl md:text-2xl font-bold text-text-heading">{clientCount}</div>
            <p className="text-[10px] md:text-xs text-text-muted">
              Sisteme kayıtlı
            </p>
          </CardContent>
        </Card>

        <Card className="card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-2 px-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-text-muted">
              Aktif Hizmetler
            </CardTitle>
            <Activity className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 py-1 md:p-6 md:pt-0">
            <div className="text-xl md:text-2xl font-bold text-text-heading">{serviceCount}</div>
            <p className="text-[10px] md:text-xs text-text-muted">
              Devam eden
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-2 card border-0">
          <CardHeader>
            <CardTitle className="text-text-heading">{name} Randevuları</CardTitle>
            <CardDescription className="text-text-muted">
              Sizin bugünkü görüşmeleriniz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TodayAppointments appointments={todayAppointments.filter(appt => appt.userId === parseInt(user?.id || "0"))} />
          </CardContent>
        </Card>

        <Card className="col-span-2 card border-0">
          <CardHeader>
            <CardTitle className="text-text-heading">Tüm Randevular</CardTitle>
            <CardDescription className="text-text-muted">
              Bugün için planlanan tüm görüşmeler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TodayAppointments appointments={todayAppointments} />
          </CardContent>
        </Card>

        <Card className="col-span-3 card border-0">
          <CardHeader>
            <CardTitle className="text-text-heading">Son Eklenen Danışanlar</CardTitle>
            <CardDescription className="text-text-muted">
              Sisteme yeni katılanlar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentClients clients={recentClients} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
