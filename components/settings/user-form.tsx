"use client";

import { createUser } from "@/app/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRef } from "react";

export function UserForm() {
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <form
            ref={formRef}
            action={async (formData) => {
                try {
                    await createUser(formData);
                    toast.success("Kullanıcı başarıyla oluşturuldu");
                    formRef.current?.reset();
                } catch (error) {
                    toast.error("Kullanıcı oluşturulurken hata oluştu");
                }
            }}
            className="flex flex-wrap gap-4 items-end"
        >
            <div className="grid gap-2 w-[180px]">
                <Label className="text-white/70">Kullanıcı Adı</Label>
                <Input name="username" required className="glass-input text-white rounded-xl border-white/10" />
            </div>
            <div className="grid gap-2 w-[180px]">
                <Label className="text-white/70">Şifre</Label>
                <Input name="password" type="password" required className="glass-input text-white rounded-xl border-white/10" />
            </div>
            <div className="grid gap-2 w-[180px]">
                <Label className="text-white/70">İsim</Label>
                <Input name="name" className="glass-input text-white rounded-xl border-white/10" />
            </div>
            <div className="grid gap-2 w-[150px]">
                <Label className="text-white/70">Rol</Label>
                <Select name="role" defaultValue="USER">
                    <SelectTrigger className="glass-input text-white rounded-xl border-white/10">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1b4b] border-white/10 text-white">
                        <SelectItem value="USER">Kullanıcı</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2 w-[150px]">
                <Label className="text-white/70">Renk</Label>
                <Select name="color" defaultValue="#F97316">
                    <SelectTrigger className="glass-input text-white rounded-xl border-white/10">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1b4b] border-white/10 text-white">
                        <SelectItem value="#F97316">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-orange-500" />
                                <span>Turuncu</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="#3B82F6">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-blue-500" />
                                <span>Mavi</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="#22C55E">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-green-500" />
                                <span>Yeşil</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="#A855F7">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-purple-500" />
                                <span>Mor</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="#EC4899">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-pink-500" />
                                <span>Pembe</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="#06B6D4">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-cyan-500" />
                                <span>Turkuaz</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-xl">Ekle</Button>
        </form>
    );
}
