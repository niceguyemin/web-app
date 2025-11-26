"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Payment {
    id: number;
    amount: number;
    date: Date;
    type: string | null;
    client: { name: string };
    service: { type: string } | null;
}

interface IncomeListProps {
    payments: Payment[];
}

export function IncomeList({ payments }: IncomeListProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPayments = useMemo(() => {
        if (!searchQuery.trim()) return payments;

        const query = searchQuery.toLowerCase();
        return payments.filter(
            (p) =>
                p.client.name.toLowerCase().includes(query) ||
                (p.service?.type || "Genel").toLowerCase().includes(query)
        );
    }, [payments, searchQuery]);

    return (
        <Card className="glass-card border-0">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-white">Gelir Listesi</CardTitle>
                    <div className="w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Danışan veya hizmet ara..."
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
                                    <th className="p-3 text-left font-medium text-white/70">Danışan</th>
                                    <th className="p-3 text-left font-medium text-white/70">Hizmet</th>
                                    <th className="p-3 text-right font-medium text-white/70">Tutar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-white/50">
                                            {searchQuery ? "Sonuç bulunamadı" : "Gelir kaydı yok"}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayments.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="p-3 text-white">
                                                {format(new Date(p.date), "d MMM yyyy", { locale: tr })}
                                            </td>
                                            <td className="p-3 text-white">{p.client.name}</td>
                                            <td className="p-3 text-white">{p.service?.type || "Genel"}</td>
                                            <td className="p-3 text-right text-green-500 font-medium">
                                                +₺{p.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {searchQuery && filteredPayments.length > 0 && (
                    <p className="text-white/50 text-sm mt-3">
                        {filteredPayments.length} sonuç bulundu
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
