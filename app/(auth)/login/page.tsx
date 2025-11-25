"use client";

import { useActionState } from "react";
import { authenticate } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="mb-8 flex flex-col items-center space-y-2">
                <div className="p-3 bg-primary rounded-full">
                    <Activity className="h-8 w-8 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Danışan Takip</h1>
                <p className="text-muted-foreground">Yönetim Paneli</p>
            </div>

            <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Giriş Yap
                    </CardTitle>
                    <CardDescription className="text-center">
                        Devam etmek için bilgilerinizi giriniz
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-4">
                        {errorMessage && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
                                {errorMessage}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="username">Kullanıcı Adı</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                required
                                placeholder="admin"
                                defaultValue="admin"
                                className="bg-background"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Şifre</Label>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                defaultValue="admin123"
                                className="bg-background"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 border-t bg-muted/50 p-4">
                    <div className="text-xs text-center text-muted-foreground">
                        Varsayılan: admin / admin123
                    </div>
                </CardFooter>
            </Card>

            <div className="mt-8 text-center text-sm text-muted-foreground">
                &copy; 2024 Danışan Takip Sistemi. Tüm hakları saklıdır.
            </div>
        </div>
    );
}
