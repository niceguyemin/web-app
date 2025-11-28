"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import { createLog } from "@/lib/logger";
import { auth } from "@/lib/auth";

export async function addMeasurement(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Bu işlem için yetkiniz yok veya oturumunuz sonlanmış.");
    }
    const clientId = parseInt(formData.get("clientId") as string);
    const weight = parseFloat(formData.get("weight") as string);
    const height = formData.get("height") ? parseFloat(formData.get("height") as string) : null;

    let bmi = null;
    if (weight && height) {
        bmi = weight / Math.pow(height / 100, 2);
    }

    const measurement = await prismadb.measurement.create({
        data: {
            clientId,
            weight,
            height,
            bmi,
        },
    });

    // Update client's current weight/height
    await prismadb.client.update({
        where: { id: clientId },
        data: {
            weight,
            height: height || undefined,
        },
    });

    const client = await prismadb.client.findUnique({
        where: { id: clientId },
        select: { name: true },
    });

    await createLog("Ölçüm Eklendi", `${client?.name} - Kilo: ${weight}kg`, measurement.id, "Measurement", null);

    revalidatePath(`/clients/${clientId}`);
}
