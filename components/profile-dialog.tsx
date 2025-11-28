"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ProfileForm } from "@/components/settings/profile-form";

interface ProfileDialogProps {
    children: React.ReactNode;
}

export function ProfileDialog({ children }: ProfileDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-white">Profilim</DialogTitle>
                    <DialogDescription className="text-white/70">
                        Kişisel bilgilerinizi ve şifrenizi buradan güncelleyebilirsiniz.
                    </DialogDescription>
                </DialogHeader>
                <div className="pt-4">
                    <ProfileForm />
                </div>
            </DialogContent>
        </Dialog>
    );
}
