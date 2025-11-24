"use client";

import { createClient } from "@/app/actions/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function NewClientPage() {
    const [error, setError] = useState<string | null>(null);

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/clients">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">Yeni Danışan Ekle</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danışan Bilgileri</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={async (formData) => {
                        try {
                            setError(null);
                            await createClient(formData);
                        } catch (err: any) {
                            // Handle Zod validation errors
                            if (err.errors && Array.isArray(err.errors)) {
                                setError(err.errors.map((e: any) => e.message).join(", "));
                            } else if (err.message) {
                                setError(err.message);
                            } else {
                                setError("Bir hata oluştu");
                            }
                        }
                    }} className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="name">Ad Soyad *</Label>
                            <Input id="name" name="name" required placeholder="Örn: Ayşe Yılmaz" minLength={2} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input id="phone" name="phone" placeholder="0555..." />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="gender">Cinsiyet</Label>
                                <Select name="gender">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seçiniz" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Kadın">Kadın</SelectItem>
                                        <SelectItem value="Erkek">Erkek</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="birthDate">Doğum Tarihi</Label>
                                <Input id="birthDate" name="birthDate" placeholder="GG.AA.YYYY" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="height">Boy (cm)</Label>
                                <Input id="height" name="height" type="number" step="0.1" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="weight">Kilo (kg)</Label>
                                <Input id="weight" name="weight" type="number" step="0.1" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notlar</Label>
                            <Textarea id="notes" name="notes" placeholder="Özel notlar..." />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" type="button" asChild>
                                <Link href="/clients">İptal</Link>
                            </Button>
                            <Button type="submit">Kaydet</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
