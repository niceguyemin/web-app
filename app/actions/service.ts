"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";



export async function createService(formData: FormData) {
    const clientId = parseInt(formData.get("clientId") as string);
    const type = formData.get("type") as string;
    const totalSessions = parseInt(formData.get("totalSessions") as string);
    const totalPrice = parseFloat(formData.get("totalPrice") as string);

    await prismadb.service.create({
        data: {
            clientId,
            type,
            totalSessions,
            remainingSessions: totalSessions,
            totalPrice,
        },
    });

    revalidatePath(`/clients/${clientId}`);
}

export async function deductSession(serviceId: number, clientId: number) {
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

    revalidatePath(`/clients/${clientId}`);
}

export async function deleteService(serviceId: number, clientId: number) {
    await prismadb.service.delete({
        where: { id: serviceId },
    });
    revalidatePath(`/clients/${clientId}`);
}
