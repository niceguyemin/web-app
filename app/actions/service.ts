"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import { createLog } from "@/lib/logger";
import { auth } from "@/lib/auth";


import { z } from "zod";

const CreateServiceSchema = z.object({
    clientId: z.coerce.number().min(1, "Geçersiz danışan ID"),
    type: z.string().min(1, "Hizmet tipi seçiniz"),
    totalSessions: z.coerce.number().min(1, "Seans sayısı en az 1 olmalı"),
    totalPrice: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz"),
});

export async function createService(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Bu işlem için yetkiniz yok veya oturumunuz sonlanmış.");
    }

    const validatedFields = CreateServiceSchema.safeParse({
        clientId: formData.get("clientId"),
        type: formData.get("type"),
        totalSessions: formData.get("totalSessions"),
        totalPrice: formData.get("totalPrice"),
    });

    if (!validatedFields.success) {
        throw new Error(validatedFields.error.issues[0].message);
    }

    const { clientId, type, totalSessions, totalPrice } = validatedFields.data;

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
