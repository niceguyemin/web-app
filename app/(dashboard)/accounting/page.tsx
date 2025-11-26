import prismadb from "@/lib/prismadb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ExpenseForm } from "./components/expense-form";
import { AccountingSummary } from "./components/accounting-summary";
import { IncomeList } from "./components/income-list";
import { ExpenseList } from "./components/expense-list";

export const dynamic = "force-dynamic"; // Prisma için
export const runtime = "nodejs";

export default async function AccountingPage() {
  const payments = await prismadb.payment.findMany({
    include: { client: true, service: true },
    orderBy: { date: "desc" },
  });

  const expenses = await prismadb.expense.findMany({
    orderBy: { date: "desc" },
  });

  // 🔧 BURAYI DÜZELTTİK
  const totalIncome = payments.reduce(
    (acc: number, curr: { amount: number }) => acc + curr.amount,
    0
  );

  const totalExpense = expenses.reduce(
    (acc: number, curr: { amount: number }) => acc + curr.amount,
    0
  );

  const netProfit = totalIncome - totalExpense;

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Muhasebe</h2>
        <div className="text-white/70 text-sm md:text-base" suppressHydrationWarning>
          {new Intl.DateTimeFormat('tr-TR', {
            day: 'numeric',
            month: 'long',
            weekday: 'long',
            timeZone: 'Europe/Istanbul'
          }).format(new Date())}
        </div>
      </div>

      <div className="grid gap-2 md:gap-4 grid-cols-3">
        <Card className="glass-card border-0">
          <CardHeader className="pb-1 p-2 md:p-6 md:pb-2">
            <CardTitle className="text-[10px] md:text-sm font-medium text-white/70">Toplam Gelir</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
            <div className="text-sm md:text-2xl font-bold text-green-500">
              ₺{totalIncome.toFixed(2)}
            </div>
            <p className="text-[8px] md:text-xs text-white/50 mt-0.5 md:mt-1">
              {payments.length} ödeme
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardHeader className="pb-1 p-2 md:p-6 md:pb-2">
            <CardTitle className="text-[10px] md:text-sm font-medium text-white/70">Toplam Gider</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
            <div className="text-sm md:text-2xl font-bold text-red-400">
              ₺{totalExpense.toFixed(2)}
            </div>
            <p className="text-[8px] md:text-xs text-white/50 mt-0.5 md:mt-1">
              {expenses.length} gider
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardHeader className="pb-1 p-2 md:p-6 md:pb-2">
            <CardTitle className="text-[10px] md:text-sm font-medium text-white/70">Net Kâr</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
            <div
              className={`text-sm md:text-2xl font-bold ${netProfit >= 0 ? "text-blue-400" : "text-red-400"
                }`}
            >
              ₺{netProfit.toFixed(2)}
            </div>
            <p className="text-[8px] md:text-xs text-white/50 mt-0.5 md:mt-1">
              {netProfit >= 0 ? "Kâr" : "Zarar"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Aşağısı aynı kaldı */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="glass-card border-0">
          <TabsTrigger value="summary">Özet</TabsTrigger>
          <TabsTrigger value="income">Gelirler</TabsTrigger>
          <TabsTrigger value="expense">Giderler</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
