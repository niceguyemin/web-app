"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("admin123");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            console.log("[login-page] Submitting credentials for:", username);
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
                credentials: "include", // Ensure cookies are sent
            });

            console.log("[login-page] Response status:", response.status);
            const data = await response.json();
            console.log("[login-page] Response data:", data);

            if (!response.ok) {
                setError(data.error || "Kullanıcı adı veya şifre hatalı");
                setIsLoading(false);
                return;
            }

            console.log("[login-page] Login successful, waiting for cookie...");
            // Wait a moment for cookie to be set, then redirect
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log("[login-page] Redirecting to /");
            // Use window.location for hard redirect to ensure proxy sees the cookie
            window.location.href = "/";
        } catch (err) {
            console.error("[login-page] Error:", err);
            setError("Bir hata oluştu. Lütfen tekrar deneyin.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Danışan<span className="text-primary">Takip</span>
                    </CardTitle>
                    <CardDescription className="text-center">
                        Hesabınıza giriş yapın
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="username">Kullanıcı Adı</Label>
                            <Input
                                id="username"
                                type="text"
                                required
                                placeholder="admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Şifre</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                        </Button>
                    </form>
                    <p className="text-xs text-center text-muted-foreground mt-4">
                        Varsayılan: admin / admin123
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
