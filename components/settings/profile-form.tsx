"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions/profile";
import { useRouter } from "next/navigation";
import { UserCircle, Lock } from "lucide-react";

export function ProfileForm() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function onSubmit(formData: FormData) {
        setLoading(true);
        try {
            await updateProfile(formData);
            await update(); // Update session on client
            toast.success("Profil güncellendi");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form action={onSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white/70 pb-2 border-b border-white/10">
                    <UserCircle className="w-4 h-4" />
                    Kişisel Bilgiler
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="username" className="text-white/70">Kullanıcı Adı</Label>
                    <Input
                        id="username"
                        value={session?.user?.email || ""} // email field holds username in our auth config
                        disabled
                        className="glass-input text-white/50"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="name" className="text-white/70">İsim Soyisim</Label>
                    <Input
                        id="name"
                        name="name"
                        defaultValue={session?.user?.name || ""}
                        placeholder="Adınız Soyadınız"
                        className="glass-input text-white"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white/70 pb-2 border-b border-white/10">
                    <Lock className="w-4 h-4" />
                    Şifre Değiştir (İsteğe Bağlı)
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="oldPassword" className="text-white/70">Mevcut Şifre</Label>
                    <Input
                        id="oldPassword"
                        name="oldPassword"
                        type="password"
                        placeholder="••••••"
                        className="glass-input text-white"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="newPassword" className="text-white/70">Yeni Şifre</Label>
                        <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            placeholder="••••••"
                            className="glass-input text-white"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword" className="text-white/70">Tekrar</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••"
                            className="glass-input text-white"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white">
                    {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </Button>
            </div>
        </form>
    );
}
