"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createLog } from "@/lib/logger";

export async function createServiceType(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;

    const serviceType = await prismadb.serviceType.create({
        data: { name },
    });

    await createLog("Hizmet Türü Eklendi", name, serviceType.id, "ServiceType", null);

    revalidatePath("/settings");
}

export async function toggleServiceType(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const id = parseInt(formData.get("id") as string);
    const active = formData.get("active") === "true";

    const previousServiceType = await prismadb.serviceType.findUnique({ where: { id } });

    const serviceType = await prismadb.serviceType.update({
        where: { id },
        data: { active },
    });

    await createLog("Hizmet Türü Durumu Değiştirildi", `${serviceType.name} - ${active ? "Aktif" : "Pasif"}`, id, "ServiceType", previousServiceType);

    revalidatePath("/settings");
}

export async function deleteServiceType(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const id = parseInt(formData.get("id") as string);

    try {
        const serviceType = await prismadb.serviceType.findUnique({ where: { id } });

        await prismadb.serviceType.delete({
            where: { id },
        });

        if (serviceType) {
            await createLog("Hizmet Türü Silindi", serviceType.name, id, "ServiceType", serviceType);
        }
    } catch (error) {
        console.error("Failed to delete service type:", error);
        // Optionally handle error (e.g. if foreign key constraint fails)
    }

    revalidatePath("/settings");
}
