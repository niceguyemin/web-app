"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions/profile";
import { useRouter } from "next/navigation";
import { User, Lock, UserCircle } from "lucide-react";

interface ProfileDialogProps {
    children: React.ReactNode;
}

export function ProfileDialog({ children }: ProfileDialogProps) {
    const { data: session, update } = useSession();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function onSubmit(formData: FormData) {
        setLoading(true);
        try {
            await updateProfile(formData);
            await update(); // Update session on client
            toast.success("Profil güncellendi");
            setOpen(false);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Profilim</DialogTitle>
                    <DialogDescription>
                        Kişisel bilgilerinizi ve şifrenizi buradan güncelleyebilirsiniz.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground pb-2 border-b">
                            <UserCircle className="w-4 h-4" />
                            Kişisel Bilgiler
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="username">Kullanıcı Adı</Label>
                            <Input
                                id="username"
                                value={session?.user?.email || ""} // email field holds username in our auth config
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">İsim Soyisim</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={session?.user?.name || ""}
                                placeholder="Adınız Soyadınız"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground pb-2 border-b">
                            <Lock className="w-4 h-4" />
                            Şifre Değiştir (İsteğe Bağlı)
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="oldPassword">Mevcut Şifre</Label>
                            <Input
                                id="oldPassword"
                                name="oldPassword"
                                type="password"
                                placeholder="••••••"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="newPassword">Yeni Şifre</Label>
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    placeholder="••••••"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Tekrar</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
