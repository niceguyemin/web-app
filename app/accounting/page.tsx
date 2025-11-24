import prismadb from "@/lib/prismadb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ExpenseForm } from "./components/expense-form";

export default async function AccountingPage() {
    const payments = await prismadb.payment.findMany({
        include: { client: true, service: true },
        orderBy: { date: "desc" },
    });

    const expenses = await prismadb.expense.findMany({
        orderBy: { date: "desc" },
    });

    const totalIncome = payments.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = totalIncome - totalExpense;

    return (
        <div className="p-8 space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Muhasebe</h2>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ₺{totalIncome.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            ₺{totalExpense.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Net Kâr</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-blue-600" : "text-red-600"}`}>
                            ₺{netProfit.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="income" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="income">Gelirler</TabsTrigger>
                    <TabsTrigger value="expense">Giderler</TabsTrigger>
                </TabsList>

                <TabsContent value="income">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gelir Listesi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left font-medium">Tarih</th>
                                            <th className="p-3 text-left font-medium">Danışan</th>
                                            <th className="p-3 text-left font-medium">Hizmet</th>
                                            <th className="p-3 text-right font-medium">Tutar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((p) => (
                                            <tr key={p.id} className="border-b last:border-0">
                                                <td className="p-3">
                                                    {format(p.date, "d MMM yyyy", { locale: tr })}
                                                </td>
                                                <td className="p-3">{p.client.name}</td>
                                                <td className="p-3">{p.service?.type || "Genel"}</td>
                                                <td className="p-3 text-right text-green-600 font-medium">
                                                    +₺{p.amount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="expense" className="space-y-4">
                    <ExpenseForm />

                    <Card>
                        <CardHeader>
                            <CardTitle>Gider Listesi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left font-medium">Tarih</th>
                                            <th className="p-3 text-left font-medium">Kategori</th>
                                            <th className="p-3 text-left font-medium">Açıklama</th>
                                            <th className="p-3 text-right font-medium">Tutar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expenses.map((e) => (
                                            <tr key={e.id} className="border-b last:border-0">
                                                <td className="p-3">
                                                    {format(e.date, "d MMM yyyy", { locale: tr })}
                                                </td>
                                                <td className="p-3">{e.category}</td>
                                                <td className="p-3">{e.description || "-"}</td>
                                                <td className="p-3 text-right text-red-600 font-medium">
                                                    -₺{e.amount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
