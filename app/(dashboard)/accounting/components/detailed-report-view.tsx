"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { addDays, format, subDays } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { getFinancialReport } from "@/app/actions/report";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { toast } from "sonner";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export function DetailedReportView() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<{
        totalIncome: number;
        totalExpense: number;
        netProfit: number;
        chartData: any[];
        incomeByServiceType: any[];
        expenseByCategory: any[];
    } | null>(null);

    const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');

    async function fetchData() {
        if (!date?.from || !date?.to) return;

        setLoading(true);
        try {
            const reportData = await getFinancialReport(date.from, date.to, granularity);
            setData(reportData);
        } catch (error) {
            toast.error("Rapor verileri alınamadı");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [date, granularity]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
        }).format(amount);
    };

    const formatXAxis = (value: string) => {
        const d = new Date(value);
        if (granularity === 'month') {
            return format(d, "MMM yyyy", { locale: tr });
        } else if (granularity === 'week') {
            return `Hafta ${format(d, "w")}`;
        }
        return format(d, "d MMM", { locale: tr });
    };

    const formatTooltipLabel = (value: string) => {
        const d = new Date(value);
        if (granularity === 'month') {
            return format(d, "MMMM yyyy", { locale: tr });
        } else if (granularity === 'week') {
            const end = new Date(d);
            end.setDate(d.getDate() + 6);
            return `${format(d, "d MMM")} - ${format(end, "d MMM yyyy", { locale: tr })}`;
        }
        return format(d, "d MMMM yyyy", { locale: tr });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="text-lg font-medium text-white">Detaylı Finansal Rapor</h3>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setGranularity('day')}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                granularity === 'day' ? "bg-primary text-white shadow-sm" : "text-white/50 hover:text-white hover:bg-white/5"
                            )}
                        >
                            Günlük
                        </button>
                        <button
                            onClick={() => setGranularity('week')}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                granularity === 'week' ? "bg-primary text-white shadow-sm" : "text-white/50 hover:text-white hover:bg-white/5"
                            )}
                        >
                            Haftalık
                        </button>
                        <button
                            onClick={() => setGranularity('month')}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                granularity === 'month' ? "bg-primary text-white shadow-sm" : "text-white/50 hover:text-white hover:bg-white/5"
                            )}
                        >
                            Aylık
                        </button>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-full sm:w-[260px] justify-start text-left font-normal hover:text-white hover:bg-white/10 transition-colors",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "d LLL y", { locale: tr })} -{" "}
                                            {format(date.to, "d LLL y", { locale: tr })}
                                        </>
                                    ) : (
                                        format(date.from, "d LLL y", { locale: tr })
                                    )
                                ) : (
                                    <span>Tarih aralığı seçin</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-popover border-white/10 text-popover-foreground" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                                locale={tr}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-white/50" />
                </div>
            ) : data ? (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="glass-card border-0">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-white/70">Toplam Gelir</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">{formatCurrency(data.totalIncome)}</div>
                            </CardContent>
                        </Card>
                        <Card className="glass-card border-0">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-white/70">Toplam Gider</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-400">{formatCurrency(data.totalExpense)}</div>
                            </CardContent>
                        </Card>
                        <Card className="glass-card border-0">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-white/70">Net Kâr</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={cn("text-2xl font-bold", data.netProfit >= 0 ? "text-blue-400" : "text-red-400")}>
                                    {formatCurrency(data.netProfit)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4 glass-card border-0">
                            <CardHeader>
                                <CardTitle className="text-white">Gelir / Gider Değişimi</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={data.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={formatXAxis}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `₺${value}`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                            contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                                            labelFormatter={formatTooltipLabel}
                                        />
                                        <Legend />

                                        <Bar dataKey="income" name="Gelir" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expense" name="Gider" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="netProfit" name="Net Kâr" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3 glass-card border-0">
                            <CardHeader>
                                <CardTitle className="text-white">Hizmet Dağılımı</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={350}>
                                    <PieChart>
                                        <Pie
                                            data={data.incomeByServiceType}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            label={({ x, y, name, percent }: { x: number; y: number; name?: string; percent?: number }) => {
                                                return (
                                                    <text x={x} y={y} fill="white" textAnchor={x > 180 ? "start" : "end"} dominantBaseline="central" style={{ fontSize: '11px', fill: 'rgba(255,255,255,0.9)' }}>
                                                        {`${name} (%${((percent || 0) * 100).toFixed(0)})`}
                                                    </text>
                                                );
                                            }}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {data.incomeByServiceType.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: "#1a1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }} itemStyle={{ color: "#fff" }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
