"use server";

import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { startOfDay, endOfDay } from "date-fns";

export async function getFinancialReport(startDate: Date, endDate: Date, granularity: 'day' | 'week' | 'month' = 'day') {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Bu işlem için yetkiniz yok.");
    }

    const start = startOfDay(startDate);
    const end = endOfDay(endDate);

    // 1. Fetch Payments (Income)
    const payments = await prismadb.payment.findMany({
        where: {
            date: {
                gte: start,
                lte: end,
            },
        },
        include: {
            service: true,
        },
    });

    // 2. Fetch Expenses
    const expenses = await prismadb.expense.findMany({
        where: {
            date: {
                gte: start,
                lte: end,
            },
        },
    });

    // 3. Calculate Totals
    const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpense;

    // 4. Prepare Chart Data: Income vs Expense over time
    const dataMap = new Map<string, { date: string; income: number; expense: number }>();

    const getKey = (date: Date) => {
        if (granularity === 'month') {
            return date.toISOString().slice(0, 7); // YYYY-MM
        } else if (granularity === 'week') {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - d.getDay() + 1); // Monday
            return d.toISOString().split("T")[0];
        }
        return date.toISOString().split("T")[0]; // YYYY-MM-DD
    };

    payments.forEach((p) => {
        const key = getKey(p.date);
        if (!dataMap.has(key)) {
            dataMap.set(key, { date: key, income: 0, expense: 0 });
        }
        dataMap.get(key)!.income += p.amount;
    });

    expenses.forEach((e) => {
        const key = getKey(e.date);
        if (!dataMap.has(key)) {
            dataMap.set(key, { date: key, income: 0, expense: 0 });
        }
        dataMap.get(key)!.expense += e.amount;
    });

    const chartData = Array.from(dataMap.values())
        .map(item => ({
            ...item,
            netProfit: item.income - item.expense
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // 5. Income by Service Type
    const incomeByServiceTypeMap = new Map<string, number>();
    payments.forEach((p) => {
        let type = p.service?.type;

        if (!type) {
            type = "Genel Ödeme";
        }

        const current = incomeByServiceTypeMap.get(type) || 0;
        incomeByServiceTypeMap.set(type, current + p.amount);
    });

    const incomeByServiceType = Array.from(incomeByServiceTypeMap.entries()).map(([name, value]) => ({
        name,
        value,
    }));

    // 6. Expense by Category
    const expenseByCategoryMap = new Map<string, number>();
    expenses.forEach((e) => {
        const category = e.category || "Diğer";
        const current = expenseByCategoryMap.get(category) || 0;
        expenseByCategoryMap.set(category, current + e.amount);
    });

    const expenseByCategory = Array.from(expenseByCategoryMap.entries()).map(([name, value]) => ({
        name,
        value,
    }));

    return {
        totalIncome,
        totalExpense,
        netProfit,
        chartData,
        incomeByServiceType,
        expenseByCategory,
    };
}
