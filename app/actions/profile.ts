"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { createLog } from "@/lib/logger";

export async function updateProfile(formData: FormData) {
    const session = await auth();
    if (!session || !session.user) {
        throw new Error("Oturum açmanız gerekiyor.");
    }

    const userId = parseInt(session.user.id);
    const name = formData.get("name") as string;
    const oldPassword = formData.get("oldPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const user = await prismadb.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error("Kullanıcı bulunamadı.");
    }

    const updateData: any = {
        name,
    };

    // Password change logic
    if (oldPassword || newPassword || confirmPassword) {
        if (!oldPassword || !newPassword || !confirmPassword) {
            throw new Error("Şifre değiştirmek için tüm alanları doldurun.");
        }

        if (newPassword !== confirmPassword) {
            throw new Error("Yeni şifreler eşleşmiyor.");
        }

        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) {
            throw new Error("Mevcut şifreniz hatalı.");
        }

        if (newPassword.length < 6) {
            throw new Error("Yeni şifre en az 6 karakter olmalı.");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updateData.password = hashedPassword;
    }

    await prismadb.user.update({
        where: { id: userId },
        data: updateData,
    });

    await createLog("Profil Güncellendi", `${user.username} profilini güncelledi`, userId, "User", null);

    revalidatePath("/");
}
