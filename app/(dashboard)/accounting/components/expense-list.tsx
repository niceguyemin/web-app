"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Expense {
    id: number;
    amount: number;
    date: Date;
    category: string;
    description: string | null;
}

interface ExpenseListProps {
    expenses: Expense[];
}

export function ExpenseList({ expenses }: ExpenseListProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredExpenses = useMemo(() => {
        if (!searchQuery.trim()) return expenses;

        const query = searchQuery.toLowerCase();
        return expenses.filter(
            (e) =>
                e.category.toLowerCase().includes(query) ||
                (e.description || "").toLowerCase().includes(query)
        );
    }, [expenses, searchQuery]);

    return (
        <Card className="glass-card border-0">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-white">Gider Listesi</CardTitle>
                    <div className="w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Kategori veya açıklama ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="p-3 text-left font-medium text-white/70">Tarih</th>
                                    <th className="p-3 text-left font-medium text-white/70">Kategori</th>
                                    <th className="p-3 text-left font-medium text-white/70">Açıklama</th>
                                    <th className="p-3 text-right font-medium text-white/70">Tutar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-white/50">
                                            {searchQuery ? "Sonuç bulunamadı" : "Gider kaydı yok"}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredExpenses.map((e) => (
                                        <tr
                                            key={e.id}
                                            className="border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="p-3 text-white">
                                                {format(new Date(e.date), "d MMM yyyy", { locale: tr })}
                                            </td>
                                            <td className="p-3 text-white">{e.category}</td>
                                            <td className="p-3 text-white">{e.description || "-"}</td>
                                            <td className="p-3 text-right text-red-400 font-medium">
                                                -₺{e.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {searchQuery && filteredExpenses.length > 0 && (
                    <p className="text-white/50 text-sm mt-3">
                        {filteredExpenses.length} sonuç bulundu
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
