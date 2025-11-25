"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";

export async function createUser(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const color = formData.get("color") as string;

    const hashedPassword = await bcrypt.hash(password, 10);

    await prismadb.user.create({
        data: {
            username,
            password: hashedPassword,
            name,
            role,
            color,
        },
    });

    revalidatePath("/settings");
}

export async function deleteUser(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const id = parseInt(formData.get("id") as string);
    await prismadb.user.delete({ where: { id } });
    revalidatePath("/settings");
}
