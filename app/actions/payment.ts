"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import { createLog } from "@/lib/logger";
import { auth } from "@/lib/auth";
import { createNotification } from "@/app/actions/notification";

export async function createPayment(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Bu işlem için yetkiniz yok veya oturumunuz sonlanmış.");
    }
    const clientId = parseInt(formData.get("clientId") as string);
    const serviceId = formData.get("serviceId") ? parseInt(formData.get("serviceId") as string) : null;
    const amount = parseFloat(formData.get("amount") as string);
    const type = formData.get("type") as string;

    if (isNaN(clientId)) {
        throw new Error("Lütfen bir danışan seçiniz.");
    }

    // Validate amount
    if (amount <= 0) {
        throw new Error("Ödeme tutarı 0'dan büyük olmalıdır");
    }

    // Check if service has remaining debt
    if (serviceId) {
        const service = await prismadb.service.findUnique({
            where: { id: serviceId },
            include: { payments: true },
        });

        if (!service) {
            throw new Error("Hizmet bulunamadı");
        }

        const paid = service.payments.reduce((sum, p) => sum + p.amount, 0);
        const remaining = service.totalPrice - paid;

        if (remaining <= 0) {
            throw new Error(`${service.type} hizmetinin borcu kalmamıştır. Ödeme eklenemez.`);
        }

        if (amount > remaining) {
            throw new Error(`Ödeme tutarı kalan borçtan (₺${remaining.toFixed(2)}) fazla olamaz`);
        }
    }

    // Create payment
    const payment = await prismadb.payment.create({
        data: {
            clientId,
            serviceId,
            amount,
            type,
        },
    });

    // Fetch client info for logging and description
    const client = await prismadb.client.findUnique({
        where: { id: clientId },
        select: { name: true },
    });

    await createLog("Ödeme Eklendi", `${amount} TL - ${client?.name} (${type})`, payment.id, "Payment", null);

    // If payment type is credit card, add 20% expense for VAT
    if (type === "Kredi Kartı") {
        const kdvAmount = amount * 0.20;

        const service = serviceId
            ? await prismadb.service.findUnique({
                where: { id: serviceId },
                select: { type: true },
            })
            : null;

        const serviceName = service ? service.type : "Genel Ödeme";
        const description = `${client?.name} - ${serviceName} - ${amount.toFixed(2)} TL - KDV: ${kdvAmount.toFixed(2)} TL`;

        // Create expense
        const expense = await prismadb.expense.create({
            data: {
                category: "KDV",
                amount: kdvAmount,
                description: description,
                paymentId: payment.id,
            },
        });

        await createLog("KDV Gideri Eklendi", `${kdvAmount.toFixed(2)} TL - ${description}`, expense.id, "Expense", null);
    }

    // Notification Logic: Notify all admins
    try {
        const admins = await prismadb.user.findMany({
            where: { role: "ADMIN" },
            select: { id: true }
        });

        const creatorName = session.user.name || session.user.email;

        await Promise.all(admins.map(admin =>
            createNotification(
                admin.id,
                "Yeni Ödeme Alındı",
                `${creatorName}, ${client?.name} kişisinden ${amount.toFixed(2)} TL ödeme aldı.`,
                "SUCCESS",
                `/clients/${clientId}?tab=payments`
            )
        ));
    } catch (error) {
        console.error("Notification error:", error);
    }

    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/settings");
    revalidatePath("/accounting");
    revalidatePath("/");
}
