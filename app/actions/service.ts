"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import { createLog } from "@/lib/logger";
import { auth } from "@/lib/auth";


export async function createService(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Bu işlem için yetkiniz yok veya oturumunuz sonlanmış.");
    }
    const clientId = parseInt(formData.get("clientId") as string);
    const type = formData.get("type") as string;
    const totalSessions = parseInt(formData.get("totalSessions") as string);
    const totalPrice = parseFloat(formData.get("totalPrice") as string);

    const service = await prismadb.service.create({
        data: {
            clientId,
            type,
            totalSessions,
            remainingSessions: totalSessions,
            totalPrice,
        },
    });

    const client = await prismadb.client.findUnique({
        where: { id: clientId },
        select: { name: true },
    });

    await createLog("Hizmet Eklendi", `${type} - ${totalPrice} TL - ${client?.name}`, service.id, "Service", null);

    revalidatePath(`/clients/${clientId}`);
}

export async function deductSession(serviceId: number, clientId: number) {
    const session = await auth();
    if (!session) {
        return;
    }
    const service = await prismadb.service.findUnique({
        where: { id: serviceId },
    });

    if (!service || service.remainingSessions <= 0) return;

    await prismadb.service.update({
        where: { id: serviceId },
        data: {
            remainingSessions: service.remainingSessions - 1,
            status: service.remainingSessions - 1 === 0 ? "COMPLETED" : "ACTIVE",
        },
    });

    const client = await prismadb.client.findUnique({
        where: { id: clientId },
        select: { name: true },
    });

    await createLog("Seans Düşüldü", `${service.type} - Kalan: ${service.remainingSessions - 1} - ${client?.name}`, serviceId, "Service", service);

    revalidatePath(`/clients/${clientId}`);
}

export async function deleteService(serviceId: number, clientId: number) {
    const session = await auth();
    if (!session) {
        throw new Error("Bu işlem için yetkiniz yok veya oturumunuz sonlanmış.");
    }
    const service = await prismadb.service.findUnique({
        where: { id: serviceId },
    });

    await prismadb.service.delete({
        where: { id: serviceId },
    });

    const client = await prismadb.client.findUnique({
        where: { id: clientId },
        select: { name: true },
    });

    if (service) {
        await createLog("Hizmet Silindi", `${service.type} - ${client?.name}`, serviceId, "Service", service);
    }

    revalidatePath(`/clients/${clientId}`);
}
