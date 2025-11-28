"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { createLog } from "@/lib/logger";

import { z } from "zod";

const CreateUserSchema = z.object({
    username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
    name: z.string().optional(),
    role: z.enum(["ADMIN", "USER"]),
    color: z.string().optional(),
});

export async function createUser(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const rawData = {
        username: formData.get("username"),
        password: formData.get("password"),
        name: formData.get("name"),
        role: formData.get("role"),
        color: formData.get("color"),
    };

    const validatedData = CreateUserSchema.safeParse(rawData);

    if (!validatedData.success) {
        throw new Error(validatedData.error.issues[0].message);
    }

    const { username, password, name, role, color } = validatedData.data;

    // Check if username exists
    const existingUser = await prismadb.user.findUnique({
        where: { username },
    });

    if (existingUser) {
        throw new Error("Bu kullanıcı adı zaten kullanılıyor");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prismadb.user.create({
        data: {
            username,
            password: hashedPassword,
            name: name || null,
            role,
            color: color || "#3B82F6",
        },
    });

    await createLog("Kullanıcı Oluşturuldu", `${username} (${role})`, user.id, "User", null);

    revalidatePath("/settings");
}

export async function deleteUser(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const id = parseInt(formData.get("id") as string);

    const user = await prismadb.user.findUnique({ where: { id } });

    await prismadb.user.delete({ where: { id } });

    if (user) {
        await createLog("Kullanıcı Silindi", user.username, id, "User", user);
    }

    revalidatePath("/settings");
}
