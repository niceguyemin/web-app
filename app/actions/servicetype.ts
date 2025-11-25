"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function createServiceType(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;

    await prismadb.serviceType.create({
        data: { name },
    });

    revalidatePath("/settings");
}

export async function toggleServiceType(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const id = parseInt(formData.get("id") as string);
    const active = formData.get("active") === "true";

    await prismadb.serviceType.update({
        where: { id },
        data: { active },
    });

    revalidatePath("/settings");
}

export async function deleteServiceType(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const id = parseInt(formData.get("id") as string);

    try {
        await prismadb.serviceType.delete({
            where: { id },
        });
    } catch (error) {
        console.error("Failed to delete service type:", error);
        // Optionally handle error (e.g. if foreign key constraint fails)
    }

    revalidatePath("/settings");
}
