"use client";

import { createExpense } from "@/app/actions/expense";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


export function ExpenseForm() {
    return (
        <Card className="glass-card border-0">
            <CardHeader>
                <CardTitle className="text-white">Gider Ekle</CardTitle>
                <CardDescription className="text-white/50">Yeni bir gider kaydı oluştur.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={createExpense} className="flex flex-wrap gap-4 items-end">
                    <div className="grid gap-2 w-[200px]">
                        <Label className="text-white/70">Kategori</Label>
                        <Select name="category" defaultValue="Kira">
                            <SelectTrigger className="glass-input text-white rounded-xl border-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-white/10 text-popover-foreground">
                                <SelectItem value="Kira" className="focus:bg-primary/20 focus:text-primary">Kira</SelectItem>
                                <SelectItem value="Fatura" className="focus:bg-primary/20 focus:text-primary">Fatura</SelectItem>
                                <SelectItem value="Maaş" className="focus:bg-primary/20 focus:text-primary">Maaş</SelectItem>
                                <SelectItem value="Malzeme" className="focus:bg-primary/20 focus:text-primary">Malzeme</SelectItem>
                                <SelectItem value="Diğer" className="focus:bg-primary/20 focus:text-primary">Diğer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2 w-[150px]">
                        <Label className="text-white/70">Tutar (TL)</Label>
                        <Input name="amount" type="number" step="0.01" required className="glass-input text-white rounded-xl border-white/10" placeholder="Örn: 1000" />
                    </div>
                    <div className="grid gap-2 flex-1 min-w-[200px]">
                        <Label className="text-white/70">Açıklama</Label>
                        <Input name="description" className="glass-input text-white rounded-xl border-white/10" placeholder="Örn: Elektrik faturası" />
                    </div>
                    <Button type="submit">Ekle</Button>
                </form>
            </CardContent>
        </Card>
    );
}
