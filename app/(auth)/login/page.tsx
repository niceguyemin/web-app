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
        <div className="h-full flex items-center justify-center">
            <Card className="w-full max-w-md glass-card border-0">
                <CardHeader className="space-y-1 text-center pb-8">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                        <Activity className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        Hoş Geldiniz
                    </CardTitle>
                    <CardDescription className="text-white/50">
                        Antigravity Sistemine Giriş Yapın
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-4">
                        {errorMessage && (
                            <div className="bg-red-500/10 text-red-200 p-3 rounded-xl text-sm border border-red-500/20 text-center">
                                {errorMessage}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-white/70">Kullanıcı Adı</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                required
                                placeholder="admin"
                                defaultValue="admin"
                                className="glass-input text-white rounded-xl h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-white/70">Şifre</Label>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                defaultValue="admin123"
                                className="glass-input text-white rounded-xl h-11"
                            />
                        </div>
                        <Button type="submit" className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/25 transition-all duration-300" disabled={isPending}>
                            {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 border-t border-white/5 p-6 bg-white/5 mt-4">
                    <div className="text-xs text-center text-white/30">
                        Varsayılan: admin / admin123
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
