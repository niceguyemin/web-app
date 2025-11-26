export const dynamic = "force-dynamic";

import prismadb from "@/lib/prismadb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar, Activity, Clock } from "lucide-react";
import { TodayAppointments } from "@/components/today-appointments";
import { RecentClients } from "@/components/recent-clients";
import { QuickAddClient } from "@/components/quick-add-client";
import { QuickAddPayment } from "@/components/quick-add-payment";
import { startOfDay, endOfDay, addDays } from "date-fns";

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

  return (
    <div className="flex-1 space-y-6 p-2 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {greeting}, {name}
          </h2>
          <div className="flex items-center gap-2">
            <QuickAddPayment clients={allClients} />
            <QuickAddClient serviceTypes={serviceTypes} />
          </div>
        </div>
        <div className="text-white/70 text-sm md:text-base">
          {new Intl.DateTimeFormat('tr-TR', {
            day: 'numeric',
            month: 'long',
            weekday: 'long',
            timeZone: 'Europe/Istanbul'
          }).format(new Date())}
        </div>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-2 px-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-white/70">
              Bugünkü Randevular
            </CardTitle>
            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 py-1 md:p-6 md:pt-0">
            <div className="text-xl md:text-2xl font-bold text-white">{todayAppointments.length}</div>
            <p className="text-[10px] md:text-xs text-white/50">
              Günün yoğunluğu
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-2 px-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-white/70">
              Gelecek Randevular
            </CardTitle>
            <Clock className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 py-1 md:p-6 md:pt-0">
            <div className="text-xl md:text-2xl font-bold text-white">{upcomingAppointmentsCount}</div>
            <p className="text-[10px] md:text-xs text-white/50">
              Önümüzdeki 7 gün
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-2 px-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-white/70">
              Toplam Danışan
            </CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 py-1 md:p-6 md:pt-0">
            <div className="text-xl md:text-2xl font-bold text-white">{clientCount}</div>
            <p className="text-[10px] md:text-xs text-white/50">
              Sisteme kayıtlı
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-2 px-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-white/70">
              Aktif Hizmetler
            </CardTitle>
            <Activity className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 py-1 md:p-6 md:pt-0">
            <div className="text-xl md:text-2xl font-bold text-white">{serviceCount}</div>
            <p className="text-[10px] md:text-xs text-white/50">
              Devam eden
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white">Bugünkü Randevular</CardTitle>
            <CardDescription className="text-white/50">
              Bugün için planlanan görüşmeler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TodayAppointments appointments={todayAppointments} />
          </CardContent>
        </Card>

        <Card className="col-span-3 glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white">Son Eklenen Danışanlar</CardTitle>
            <CardDescription className="text-white/50">
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
