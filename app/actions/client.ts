"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createLog } from "@/lib/logger";
import { auth } from "@/lib/auth";

const ClientSchema = z.object({
    name: z.string().min(2, "İsim en az 2 karakter olmalı"),
    phone: z.string().optional(),
    gender: z.string().optional(),
    birthDate: z.string().optional(),
    height: z.string().transform((val) => (val ? parseFloat(val) : null)).optional(),
    weight: z.string().transform((val) => (val ? parseFloat(val) : null)).optional(),
    notes: z.string().optional(),
});

export async function createClient(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Bu işlem için yetkiniz yok veya oturumunuz sonlanmış.");
    }
    const rawData = {
        name: formData.get("name"),
        phone: formData.get("phone") || undefined,
        gender: formData.get("gender") || undefined,
        birthDate: formData.get("birthDate") || undefined,
        height: formData.get("height") || undefined,
        weight: formData.get("weight") || undefined,
        notes: formData.get("notes") || undefined,
    };

    const validatedData = ClientSchema.safeParse(rawData);

    if (!validatedData.success) {
        throw new Error(validatedData.error.issues[0].message);
    }

    // Ensure phone number has +90 prefix if not empty
    let phone = validatedData.data.phone as string;
    if (phone && !phone.startsWith("+90")) {
        phone = "+90" + phone.replace(/^0+/, ""); // Remove leading zeros if any
    }

    // Service data
    const serviceType = formData.get("serviceType") as string;
    const servicePrice = formData.get("servicePrice") ? parseFloat(formData.get("servicePrice") as string) : null;
    const serviceSessions = formData.get("serviceSessions") ? parseInt(formData.get("serviceSessions") as string) : null;

    const client = await prismadb.client.create({
        data: {
            name: validatedData.data.name,
            phone: phone,
            gender: validatedData.data.gender as string,
            birthDate: validatedData.data.birthDate as string,
            height: validatedData.data.height,
            weight: validatedData.data.weight,
            notes: validatedData.data.notes as string,
        },
    });

    await createLog("Danışan Oluşturuldu", client.name, client.id, "Client", null);

    if (serviceType && servicePrice && serviceSessions) {
        const service = await prismadb.service.create({
            data: {
                clientId: client.id,
                type: serviceType,
                totalSessions: serviceSessions,
                remainingSessions: serviceSessions,
                totalPrice: servicePrice,
                status: "ACTIVE",
            },
        });
        await createLog("Hizmet Eklendi", `${serviceType} - ${servicePrice} TL (Yeni Danışan)`, service.id, "Service", null);
    }

    revalidatePath("/clients");
    revalidatePath("/"); // Revalidate dashboard
    revalidatePath("/appointments"); // Revalidate appointments
    // redirect("/clients"); // Don't redirect if called from quick add
}

export async function getClients() {
    return await prismadb.client.findMany({
        include: {
            services: {
                where: {
                    status: "ACTIVE",
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });
}

export async function deleteClient(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Bu işlem için yetkiniz yok veya oturumunuz sonlanmış.");
    }
    const id = parseInt(formData.get("id") as string);

    const client = await prismadb.client.findUnique({
        where: { id },
        include: {
            services: true,
            measurements: true,
            appointments: true,
            payments: {
                include: {
                    expenses: true
                }
            }
        }
    });

    await prismadb.client.delete({
        where: { id },
    });

    if (client) {
        await createLog("Danışan Silindi", `${client.name} (ID: ${id})`, id, "Client", client);
    }

    revalidatePath("/clients");
    redirect("/clients");
}

export async function updateClient(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Bu işlem için yetkiniz yok veya oturumunuz sonlanmış.");
    }
    const id = parseInt(formData.get("id") as string);
    const rawData = {
        name: formData.get("name"),
        phone: formData.get("phone"),
        gender: formData.get("gender"),
        birthDate: formData.get("birthDate"),
        notes: formData.get("notes"),
    };

    // Validate using schema (partial validation for update might be needed, but here we use the same schema for simplicity or create a partial one)
    // Since update form sends all fields, we can reuse ClientSchema but we need to handle optional fields correctly if they are missing from formData?
    // The schema defines most fields as optional except name.
    // However, the schema transforms strings to numbers for height/weight, which are not in update form data here (EditClientDialog doesn't seem to send height/weight? Let's check).
    // EditClientDialog sends name, phone, gender, birthDate, notes. Height/weight are in "Advanced" in Create but not in Edit?
    // EditClientDialog has inputs for name, phone, gender, birthDate, notes.
    // So we should use a schema that matches this.
    // Or just manually validate name.

    if (!rawData.name || (rawData.name as string).length < 2) {
        throw new Error("İsim en az 2 karakter olmalı");
    }

    // Ensure phone number has +90 prefix if not empty
    let phone = rawData.phone as string;
    if (phone && !phone.startsWith("+90")) {
        phone = "+90" + phone.replace(/^0+/, ""); // Remove leading zeros if any
    }

    const previousClient = await prismadb.client.findUnique({ where: { id } });

    await prismadb.client.update({
        where: { id },
        data: {
            name: rawData.name as string,
            phone: phone,
            gender: rawData.gender as string,
            birthDate: rawData.birthDate as string,
            notes: rawData.notes as string,
        },
    });

    await createLog("Danışan Güncellendi", rawData.name as string, id, "Client", previousClient);

    revalidatePath(`/clients/${id}`);
    revalidatePath("/clients");
}
