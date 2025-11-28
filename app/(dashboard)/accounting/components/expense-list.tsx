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
        <Card className="md:card border-0 shadow-none bg-transparent md:bg-card">
            <CardHeader className="px-4 md:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-text-heading">Gider Listesi</CardTitle>
                    <div className="w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Kategori veya açıklama ara (Örn: Kira, Elektrik...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 glass-input text-white rounded-xl border-white/10 placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
                <div className="md:rounded-xl md:border md:border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="p-3 text-left font-medium text-text-muted">Tarih</th>
                                    <th className="p-3 text-left font-medium text-text-muted">Kategori</th>
                                    <th className="p-3 text-left font-medium text-text-muted">Açıklama</th>
                                    <th className="p-3 text-right font-medium text-text-muted">Tutar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-text-muted">
                                            {searchQuery ? "Sonuç bulunamadı" : "Gider kaydı yok"}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredExpenses.map((e) => (
                                        <tr
                                            key={e.id}
                                            className="border-b border-white/10 last:border-0 odd:bg-background-card/80 even:bg-background-card/60 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="p-3 text-text-heading">
                                                {format(new Date(e.date), "d MMM yyyy", { locale: tr })}
                                            </td>
                                            <td className="p-3 text-text-heading">{e.category}</td>
                                            <td className="p-3 text-text-heading">{e.description || "-"}</td>
                                            <td className="p-3 text-right text-error font-medium">
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
                    <p className="text-text-muted text-sm mt-3">
                        {filteredExpenses.length} sonuç bulundu
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
