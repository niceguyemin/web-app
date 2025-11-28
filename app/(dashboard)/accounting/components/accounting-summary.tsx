"use client";

import { useState, useMemo, useEffect } from "react";
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
    const [selectedMonth, setSelectedMonth] = useState("");
    const [viewType, setViewType] = useState<"monthly" | "yearly">("monthly");
    const [mounted, setMounted] = useState(false);

    // Initialize on client side only
    useEffect(() => {
        const currentDate = new Date();
        setSelectedMonth(format(currentDate, "yyyy-MM"));
        setMounted(true);
    }, []);

    // Generate month options for the last 12 months
    const monthOptions = useMemo(() => {
        if (!mounted) return [];
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
    }, [mounted]);

    // Generate year options
    const yearOptions = useMemo(() => {
        if (!mounted) return [];
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
    }, [mounted]);

    // Filter data based on selected period
    const filteredData = useMemo(() => {
        if (!mounted || !selectedMonth) {
            return {
                payments: [],
                expenses: [],
                totalIncome: 0,
                totalExpense: 0,
                netProfit: 0,
            };
        }

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
    }, [payments, expenses, selectedMonth, viewType, mounted]);

    if (!mounted) {
        return (
            <Card className="glass-card border-0">
                <CardHeader>
                    <CardTitle className="text-white">Finansal Özet</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-white/5 rounded"></div>
                        <div className="grid gap-3 grid-cols-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-20 bg-white/5 rounded"></div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const formatCurrency = (amount: number) => {
        const hasDecimals = amount % 1 !== 0;
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: hasDecimals ? 2 : 0,
            maximumFractionDigits: hasDecimals ? 2 : 0,
        }).format(amount);
    };

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
                            <SelectContent className="bg-popover border-white/10 text-popover-foreground">
                                <SelectItem value="monthly" className="focus:bg-primary/20 focus:text-primary">
                                    Aylık
                                </SelectItem>
                                <SelectItem value="yearly" className="focus:bg-primary/20 focus:text-primary">
                                    Yıllık
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-full sm:w-48 glass-input text-white rounded-xl border-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-white/10 text-white">
                                {viewType === "monthly"
                                    ? monthOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                            className="focus:bg-primary/20 focus:text-primary"
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
                    <div className="text-center p-3 md:p-4 rounded-xl bg-card border border-white/10">
                        <p className="text-white/50 text-xs md:text-sm mb-1">Toplam Gelir</p>
                        <p className="text-lg md:text-2xl font-bold text-green-500">
                            ₺{formatCurrency(filteredData.totalIncome)}
                        </p>
                    </div>
                    <div className="text-center p-3 md:p-4 rounded-xl bg-card border border-white/10">
                        <p className="text-white/50 text-xs md:text-sm mb-1">Toplam Gider</p>
                        <p className="text-lg md:text-2xl font-bold text-red-400">
                            ₺{formatCurrency(filteredData.totalExpense)}
                        </p>
                    </div>
                    <div className="text-center p-3 md:p-4 rounded-xl bg-card border border-white/10">
                        <p className="text-white/50 text-xs md:text-sm mb-1">Net Kâr</p>
                        <p
                            className={`text-lg md:text-2xl font-bold ${filteredData.netProfit >= 0 ? "text-blue-400" : "text-red-400"
                                }`}
                        >
                            ₺{formatCurrency(filteredData.netProfit)}
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
                                        ? formatCurrency(filteredData.totalIncome / filteredData.payments.length)
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
                                        ? formatCurrency(filteredData.totalExpense / filteredData.expenses.length)
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
