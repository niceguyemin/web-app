"use server";

import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { startOfDay, endOfDay } from "date-fns";

export async function getFinancialReport(startDate: Date, endDate: Date) {
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

    // 4. Prepare Chart Data: Income vs Expense over time (Daily)
    // We'll group by day.
    const dailyDataMap = new Map<string, { date: string; income: number; expense: number }>();

    payments.forEach((p) => {
        const dateKey = p.date.toISOString().split("T")[0]; // YYYY-MM-DD
        if (!dailyDataMap.has(dateKey)) {
            dailyDataMap.set(dateKey, { date: dateKey, income: 0, expense: 0 });
        }
        dailyDataMap.get(dateKey)!.income += p.amount;
    });

    expenses.forEach((e) => {
        const dateKey = e.date.toISOString().split("T")[0];
        if (!dailyDataMap.has(dateKey)) {
            dailyDataMap.set(dateKey, { date: dateKey, income: 0, expense: 0 });
        }
        dailyDataMap.get(dateKey)!.expense += e.amount;
    });

    const chartData = Array.from(dailyDataMap.values()).sort((a, b) => a.date.localeCompare(b.date));

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
