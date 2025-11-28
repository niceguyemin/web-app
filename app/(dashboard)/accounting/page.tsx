import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ExpenseForm } from "./components/expense-form";
import { AccountingSummary } from "./components/accounting-summary";
import { IncomeList } from "./components/income-list";
import { ExpenseList } from "./components/expense-list";
import { DetailedReportView } from "./components/detailed-report-view";

export const dynamic = "force-dynamic"; // Prisma için
export const runtime = "nodejs";

export default async function AccountingPage() {
  const session = await auth();

  if ((session?.user as any)?.role !== "ADMIN") {
    redirect("/");
  }

  const payments = await prismadb.payment.findMany({
    include: { client: true, service: true },
    orderBy: { date: "desc" },
  });

  const expenses = await prismadb.expense.findMany({
    orderBy: { date: "desc" },
  });

  const services = await prismadb.service.findMany({
    select: {
      clientId: true,
      totalPrice: true,
    },
  });

  // Calculate total expected payments (receivables)
  const clientDebts = new Map<number, number>();

  // Add all service costs to client debt
  services.forEach((service: { clientId: number; totalPrice: number }) => {
    const currentDebt = clientDebts.get(service.clientId) || 0;
    clientDebts.set(service.clientId, currentDebt + service.totalPrice);
  });

  // Subtract all payments from client debt
  payments.forEach((payment: { clientId: number; amount: number }) => {
    const currentDebt = clientDebts.get(payment.clientId) || 0;
    clientDebts.set(payment.clientId, currentDebt - payment.amount);
  });

  // Sum up only positive debts (receivables)
  let totalExpectedPayments = 0;
  clientDebts.forEach((debt) => {
    if (debt > 0) {
      totalExpectedPayments += debt;
    }
  });

  const totalIncome = payments.reduce(
    (acc: number, curr: { amount: number }) => acc + curr.amount,
    0
  );

  const totalExpense = expenses.reduce(
    (acc: number, curr: { amount: number }) => acc + curr.amount,
    0
  );

  const netProfit = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    const hasDecimals = amount % 1 !== 0;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    }).format(amount);
  };

  return (
    <div className="p-0 md:p-8 space-y-4 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 p-4 md:p-0">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-heading">Muhasebe</h2>
        <div className="text-text-muted text-sm md:text-base" suppressHydrationWarning>
          {new Intl.DateTimeFormat('tr-TR', {
            day: 'numeric',
            month: 'long',
            weekday: 'long',
            timeZone: 'Europe/Istanbul'
          }).format(new Date())}
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 px-4 md:px-0">
        <Card className="card border-0">
          <CardHeader className="pb-1 p-2 md:p-6 md:pb-2">
            <CardTitle className="text-[10px] md:text-sm font-medium text-text-muted">Toplam Gelir</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
            <div className="text-sm md:text-2xl font-bold text-secondary">
              ₺{formatCurrency(totalIncome)}
            </div>
            <p className="text-[8px] md:text-xs text-text-muted mt-0.5 md:mt-1">
              {payments.length} ödeme
            </p>
          </CardContent>
        </Card>
        <Card className="card border-0">
          <CardHeader className="pb-1 p-2 md:p-6 md:pb-2">
            <CardTitle className="text-[10px] md:text-sm font-medium text-text-muted">Toplam Gider</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
            <div className="text-sm md:text-2xl font-bold text-error">
              ₺{formatCurrency(totalExpense)}
            </div>
            <p className="text-[8px] md:text-xs text-text-muted mt-0.5 md:mt-1">
              {expenses.length} gider
            </p>
          </CardContent>
        </Card>
        <Card className="card border-0">
          <CardHeader className="pb-1 p-2 md:p-6 md:pb-2">
            <CardTitle className="text-[10px] md:text-sm font-medium text-text-muted">Net Kâr</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
            <div
              className={`text-sm md:text-2xl font-bold ${netProfit >= 0 ? "text-primary" : "text-error"
                }`}
            >
              ₺{formatCurrency(netProfit)}
            </div>
            <p className="text-[8px] md:text-xs text-text-muted mt-0.5 md:mt-1">
              {netProfit >= 0 ? "Kâr" : "Zarar"}
            </p>
          </CardContent>
        </Card>
        <Card className="card border-0">
          <CardHeader className="pb-1 p-2 md:p-6 md:pb-2">
            <CardTitle className="text-[10px] md:text-sm font-medium text-text-muted">Beklenen Ödemeler</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
            <div className="text-sm md:text-2xl font-bold text-warning">
              ₺{formatCurrency(totalExpectedPayments)}
            </div>
            <p className="text-[8px] md:text-xs text-text-muted mt-0.5 md:mt-1">
              Alacaklar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Aşağısı aynı kaldı */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="card border-0">
          <TabsTrigger value="summary">Özet</TabsTrigger>
          <TabsTrigger value="income">Gelirler</TabsTrigger>
          <TabsTrigger value="expense">Giderler</TabsTrigger>
          <TabsTrigger value="reports">Raporlar</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <AccountingSummary payments={payments} expenses={expenses} />
        </TabsContent>

        <TabsContent value="income">
          <IncomeList payments={payments} />
        </TabsContent>

        <TabsContent value="expense" className="space-y-4">
          <ExpenseForm />
          <ExpenseList expenses={expenses} />
        </TabsContent>

        <TabsContent value="reports">
          <DetailedReportView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
