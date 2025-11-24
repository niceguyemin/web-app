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
        phone: formData.get("phone"),
        gender: formData.get("gender"),
        birthDate: formData.get("birthDate"),
        height: formData.get("height"),
        weight: formData.get("weight"),
        notes: formData.get("notes"),
    };

    const validatedData = ClientSchema.parse(rawData);

    await prismadb.client.create({
        data: {
            name: validatedData.name,
            phone: validatedData.phone as string,
            gender: validatedData.gender as string,
            birthDate: validatedData.birthDate as string,
            height: validatedData.height,
            weight: validatedData.weight,
            notes: validatedData.notes as string,
        },
    });

    revalidatePath("/clients");
    redirect("/clients");
}

export async function deleteClient(formData: FormData) {
    const id = parseInt(formData.get("id") as string);

    await prismadb.client.delete({
        where: { id },
    });

    revalidatePath("/clients");
    redirect("/clients");
}
