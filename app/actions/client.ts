"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

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
    const rawData = {
        name: formData.get("name"),
        phone: formData.get("phone") || undefined,
        gender: formData.get("gender") || undefined,
        birthDate: formData.get("birthDate") || undefined,
        height: formData.get("height") || undefined,
        weight: formData.get("weight") || undefined,
        notes: formData.get("notes") || undefined,
    };

    const validatedData = ClientSchema.parse(rawData);

    // Ensure phone number has +90 prefix if not empty
    let phone = validatedData.phone as string;
    if (phone && !phone.startsWith("+90")) {
        phone = "+90" + phone.replace(/^0+/, ""); // Remove leading zeros if any
    }

    // Service data
    const serviceType = formData.get("serviceType") as string;
    const servicePrice = formData.get("servicePrice") ? parseFloat(formData.get("servicePrice") as string) : null;
    const serviceSessions = formData.get("serviceSessions") ? parseInt(formData.get("serviceSessions") as string) : null;

    const client = await prismadb.client.create({
        data: {
            name: validatedData.name,
            phone: phone,
            gender: validatedData.gender as string,
            birthDate: validatedData.birthDate as string,
            height: validatedData.height,
            weight: validatedData.weight,
            notes: validatedData.notes as string,
        },
    });

    if (serviceType && servicePrice && serviceSessions) {
        await prismadb.service.create({
            data: {
                clientId: client.id,
                type: serviceType,
                totalSessions: serviceSessions,
                remainingSessions: serviceSessions,
                totalPrice: servicePrice,
                status: "ACTIVE",
            },
        });
    }

    revalidatePath("/clients");
    revalidatePath("/"); // Revalidate dashboard
    // redirect("/clients"); // Don't redirect if called from quick add
}

export async function deleteClient(formData: FormData) {
    const id = parseInt(formData.get("id") as string);

    await prismadb.client.delete({
        where: { id },
    });

    revalidatePath("/clients");
    redirect("/clients");
}

export async function updateClient(formData: FormData) {
    const id = parseInt(formData.get("id") as string);
    const rawData = {
        name: formData.get("name"),
        phone: formData.get("phone"),
        gender: formData.get("gender"),
        birthDate: formData.get("birthDate"),
        notes: formData.get("notes"),
    };

    // Ensure phone number has +90 prefix if not empty
    let phone = rawData.phone as string;
    if (phone && !phone.startsWith("+90")) {
        phone = "+90" + phone.replace(/^0+/, ""); // Remove leading zeros if any
    }

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

    revalidatePath(`/clients/${id}`);
    revalidatePath("/clients");
}
