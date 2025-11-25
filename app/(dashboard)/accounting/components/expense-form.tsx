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
        <Card>
            <CardHeader>
                <CardTitle>Gider Ekle</CardTitle>
                <CardDescription>Yeni bir gider kaydı oluştur.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={createExpense} className="flex flex-wrap gap-4 items-end">
                    <div className="grid gap-2 w-[200px]">
                        <Label>Kategori</Label>
                        <Select name="category" defaultValue="Kira">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Kira">Kira</SelectItem>
                                <SelectItem value="Fatura">Fatura</SelectItem>
                                <SelectItem value="Maaş">Maaş</SelectItem>
                                <SelectItem value="Malzeme">Malzeme</SelectItem>
                                <SelectItem value="Diğer">Diğer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2 w-[150px]">
                        <Label>Tutar (TL)</Label>
                        <Input name="amount" type="number" step="0.01" required />
                    </div>
                    <div className="grid gap-2 flex-1 min-w-[200px]">
                        <Label>Açıklama</Label>
                        <Input name="description" placeholder="Örn: Elektrik faturası" />
                    </div>
                    <Button type="submit">Ekle</Button>
                </form>
            </CardContent>
        </Card>
    );
}
