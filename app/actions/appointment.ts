"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLog } from "@/lib/logger";
import { auth } from "@/lib/auth";

const CreateAppointmentSchema = z.object({
    clientId: z.coerce.number(),
    serviceId: z.coerce.number().optional(),
    userId: z.coerce.number().optional(),
    date: z.string(), // ISO string
    time: z.string(), // HH:mm
    notes: z.string().optional(),
});

export async function createAppointment(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Bu işlem için yetkiniz yok veya oturumunuz sonlanmış.");
    }
    const validatedFields = CreateAppointmentSchema.safeParse({
        clientId: formData.get("clientId"),
        serviceId: formData.get("serviceId") || undefined,
        userId: formData.get("userId") || undefined,
        date: formData.get("date"),
        time: formData.get("time"),
        notes: formData.get("notes"),
    });

    if (!validatedFields.success) {
        throw new Error("Form verileri eksik veya hatalı.");
    }

    const { clientId, serviceId, userId, date, time, notes } = validatedFields.data;

    // Combine date and time
    const appointmentDate = new Date(`${date}T${time}`);

    try {
        await prismadb.$transaction(async (tx) => {
            // If a service is selected, check and decrement remaining sessions
            if (serviceId) {
                const service = await tx.service.findUnique({
                    where: { id: serviceId },
                });

                if (!service) {
                    throw new Error("Seçilen hizmet bulunamadı");
                }

                if (service.remainingSessions <= 0) {
                    throw new Error("Bu hizmet için kalan seans hakkı bulunmamaktadır");
                }

                await tx.service.update({
                    where: { id: serviceId },
                    data: {
                        remainingSessions: service.remainingSessions - 1,
                    },
                });
            }

            // Create the appointment
            const appointment = await tx.appointment.create({
                data: {
                    clientId,
                    serviceId,
                    userId,
                    date: appointmentDate,
                    notes,
                },
            });

            const client = await tx.client.findUnique({
                where: { id: clientId },
                select: { name: true },
            });

            await createLog("Randevu Oluşturuldu", `${client?.name} - ${date} ${time}`, appointment.id, "Appointment", null);
        });

        revalidatePath("/appointments");
        revalidatePath("/");
    } catch (error) {
        console.error("Appointment creation error:", error);
        throw new Error("Randevu oluşturulurken bir hata oluştu");
    }
}

export async function cancelAppointment(id: number) {
    const session = await auth();
    if (!session) {
        throw new Error("Bu işlem için yetkiniz yok veya oturumunuz sonlanmış.");
    }
    try {
        await prismadb.$transaction(async (tx) => {
            // Get the appointment to find the serviceId
            const appointment = await tx.appointment.findUnique({
                where: { id },
                include: { client: { select: { name: true } } }
            });

            if (!appointment) {
                throw new Error("Randevu bulunamadı");
            }

            // Delete the appointment (or update status to CANCELLED if you prefer soft delete)
            // Here we are deleting it as per "cancel" usually implying removal in this context, 
            // but if you want to keep history, we should update status. 
            // Let's assume we update status to CANCELLED for history, or DELETE if it's just removing.
            // The user said "iptal etme özelliği", let's update status to CANCELLED.

            // Actually, to keep it simple and consistent with "deleteAppointment" previously existing,
            // let's update the status to CANCELLED.

            await tx.appointment.update({
                where: { id },
                data: { status: "CANCELLED" },
            });

            // If it was linked to a service, increment remaining sessions
            if (appointment.serviceId) {
                await tx.service.update({
                    where: { id: appointment.serviceId },
                    data: {
                        remainingSessions: {
                            increment: 1,
                        },
                    },
                });
            }

            await createLog("Randevu İptal Edildi", `${appointment.client.name} - ${appointment.date.toLocaleString("tr-TR")}`, id, "Appointment", appointment);
        });

        revalidatePath("/appointments");
        revalidatePath("/");
    } catch (error) {
        console.error("Appointment cancellation error:", error);
        throw new Error("Randevu iptal edilirken bir hata oluştu");
    }
}

export async function deleteAppointment(id: number) {
    const session = await auth();
    if (!session) {
        throw new Error("Bu işlem için yetkiniz yok veya oturumunuz sonlanmış.");
    }
    // Kept for backward compatibility or admin cleanup if needed, 
    // but user flow should use cancelAppointment for session logic.
    try {
        const appointment = await prismadb.appointment.findUnique({
            where: { id },
            include: { client: { select: { name: true } } }
        });

        await prismadb.appointment.delete({
            where: { id },
        });

        if (appointment) {
            await createLog("Randevu Silindi", `${appointment.client.name} - ${appointment.date.toLocaleString("tr-TR")}`, id, "Appointment", appointment);
        }

        revalidatePath("/appointments");
    } catch (error) {
        throw new Error("Randevu silinirken bir hata oluştu");
    }
}
