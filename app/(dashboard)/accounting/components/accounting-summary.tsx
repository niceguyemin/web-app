"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns";
import { tr } from "date-fns/locale";

interface Payment {
    id: number;
    amount: number;
    date: Date;
    client: { name: string };
    service: { type: string } | null;
}

interface Expense {
    id: number;
    amount: number;
    date: Date;
    category: string;
}

interface AccountingSummaryProps {
    payments: Payment[];
    expenses: Expense[];
}

export function AccountingSummary({ payments, expenses }: AccountingSummaryProps) {
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(format(currentDate, "yyyy-MM"));
    const [viewType, setViewType] = useState<"monthly" | "yearly">("monthly");

    // Generate month options for the last 12 months
    const monthOptions = useMemo(() => {
        const options = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            options.push({
                value: format(date, "yyyy-MM"),
                label: format(date, "MMMM yyyy", { locale: tr }),
            });
        }
        return options;
    }, []);

    // Generate year options
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const options = [];
        for (let i = 0; i < 5; i++) {
            const year = currentYear - i;
            options.push({
                value: year.toString(),
                label: year.toString(),
            });
        }
        return options;
    }, []);

    // Filter data based on selected period
    const filteredData = useMemo(() => {
        let dateRange: { start: Date; end: Date };

        if (viewType === "monthly") {
            const [year, month] = selectedMonth.split("-").map(Number);
            const date = new Date(year, month - 1);
            dateRange = {
                start: startOfMonth(date),
                end: endOfMonth(date),
            };
        } else {
            const year = parseInt(selectedMonth);
            const date = new Date(year, 0);
            dateRange = {
                start: startOfYear(date),
                end: endOfYear(date),
            };
        }

        const filteredPayments = payments.filter((p) =>
            isWithinInterval(new Date(p.date), dateRange)
        );

        const filteredExpenses = expenses.filter((e) =>
            isWithinInterval(new Date(e.date), dateRange)
        );

        const totalIncome = filteredPayments.reduce((acc, p) => acc + p.amount, 0);
        const totalExpense = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

        return {
            payments: filteredPayments,
            expenses: filteredExpenses,
            totalIncome,
            totalExpense,
            netProfit: totalIncome - totalExpense,
        };
    }, [payments, expenses, selectedMonth, viewType]);

    return (
        <Card className="glass-card border-0">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-white">Finansal Özet</CardTitle>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Select value={viewType} onValueChange={(v) => setViewType(v as "monthly" | "yearly")}>
                            <SelectTrigger className="w-full sm:w-32 glass-input text-white rounded-xl border-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1b4b] border-white/10 text-white">
                                <SelectItem value="monthly" className="focus:bg-white/10 focus:text-white">
                                    Aylık
                                </SelectItem>
                                <SelectItem value="yearly" className="focus:bg-white/10 focus:text-white">
                                    Yıllık
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-full sm:w-48 glass-input text-white rounded-xl border-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1b4b] border-white/10 text-white">
                                {viewType === "monthly"
                                    ? monthOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                            className="focus:bg-white/10 focus:text-white"
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))
                                    : yearOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                            className="focus:bg-white/10 focus:text-white"
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-3 md:gap-4 grid-cols-3">
                    <div className="text-center p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-white/50 text-xs md:text-sm mb-1">Toplam Gelir</p>
                        <p className="text-lg md:text-2xl font-bold text-green-500">
                            ₺{filteredData.totalIncome.toFixed(2)}
                        </p>
                    </div>
                    <div className="text-center p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-white/50 text-xs md:text-sm mb-1">Toplam Gider</p>
                        <p className="text-lg md:text-2xl font-bold text-red-400">
                            ₺{filteredData.totalExpense.toFixed(2)}
                        </p>
                    </div>
                    <div className="text-center p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-white/50 text-xs md:text-sm mb-1">Net Kâr</p>
                        <p
                            className={`text-lg md:text-2xl font-bold ${filteredData.netProfit >= 0 ? "text-blue-400" : "text-red-400"
                                }`}
                        >
                            ₺{filteredData.netProfit.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Details */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-white/70">Gelir Dağılımı</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-white/70 text-sm">Toplam İşlem</span>
                                <span className="text-white font-medium">{filteredData.payments.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/70 text-sm">Ortalama Ödeme</span>
                                <span className="text-green-500 font-medium">
                                    ₺
                                    {filteredData.payments.length > 0
                                        ? (filteredData.totalIncome / filteredData.payments.length).toFixed(2)
                                        : "0.00"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-white/70">Gider Dağılımı</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-white/70 text-sm">Toplam İşlem</span>
                                <span className="text-white font-medium">{filteredData.expenses.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/70 text-sm">Ortalama Gider</span>
                                <span className="text-red-400 font-medium">
                                    ₺
                                    {filteredData.expenses.length > 0
                                        ? (filteredData.totalExpense / filteredData.expenses.length).toFixed(2)
                                        : "0.00"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
