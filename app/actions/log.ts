"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createLog } from "@/lib/logger";

export async function undoLog(logId: number) {
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const log = await prismadb.log.findUnique({
        where: { id: logId },
    });

    if (!log || !log.relatedId || !log.relatedTable) {
        throw new Error("Geri alınabilir bir işlem bulunamadı.");
    }

    const { relatedId, relatedTable, previousData, action } = log;
    const parsedPreviousData = previousData ? JSON.parse(previousData as string) : null;

    try {
        // Check for linked records (Expense -> Payment)
        // If undoing a VAT expense, we should undo the parent Payment instead to ensure consistency
        if (relatedTable === "Expense" && (action.includes("Eklendi") || action.includes("Oluşturuldu"))) {
            const expense = await prismadb.expense.findUnique({
                where: { id: relatedId },
                select: { paymentId: true }
            });

            if (expense && expense.paymentId) {
                // Find the parent payment log
                const paymentLog = await prismadb.log.findFirst({
                    where: {
                        relatedId: expense.paymentId,
                        relatedTable: "Payment",
                        action: { contains: "Eklendi" },
                        isUndone: false
                    }
                });

                if (paymentLog) {
                    // Redirect undo to the parent payment
                    return await undoLog(paymentLog.id);
                }
            }
        }

        // Handle "Create" actions (Undo = Delete)
        if (action.includes("Eklendi") || action.includes("Oluşturuldu")) {
            await deleteRecord(relatedTable, relatedId);
            await createLog(`Geri Alma: ${action}`, `ID: ${relatedId} silindi.`);
        }
        // Handle "Delete" actions (Undo = Create/Restore)
        else if (action.includes("Silindi")) {
            if (!parsedPreviousData) throw new Error("Silinen veri bulunamadı.");
            await restoreRecord(relatedTable, parsedPreviousData);
            await createLog(`Geri Alma: ${action}`, `ID: ${relatedId} geri yüklendi.`);
        }
        // Handle "Update" actions (Undo = Update back to previous)
        else if (action.includes("Güncellendi") || action.includes("Değiştirildi") || action.includes("İptal Edildi") || action.includes("Seans Düşüldü")) {
            if (!parsedPreviousData) throw new Error("Eski veri bulunamadı.");
            await updateRecord(relatedTable, relatedId, parsedPreviousData);
            await createLog(`Geri Alma: ${action}`, `ID: ${relatedId} eski haline döndürüldü.`);
        }

        // Mark the original log as undone
        await prismadb.log.update({
            where: { id: logId },
            data: { isUndone: true },
        });

        revalidatePath("/settings");
        revalidatePath("/accounting");
        revalidatePath("/");
    } catch (error) {
        console.error("Undo error:", error);
        throw new Error("İşlem geri alınırken bir hata oluştu: " + (error as Error).message);
    }
}

async function deleteRecord(table: string, id: number) {
    const modelName = table.charAt(0).toLowerCase() + table.slice(1);

    // Special handling for Appointment deletion (Undo Create)
    if (table === "Appointment") {
        const appointment = await prismadb.appointment.findUnique({
            where: { id },
        });

        if (appointment && appointment.serviceId) {
            await prismadb.service.update({
                where: { id: appointment.serviceId },
                data: {
                    remainingSessions: {
                        increment: 1,
                    },
                },
            });
        }
    }

    // Special handling for Payment deletion (Undo Create) to revalidate client page and delete associated expenses (VAT)
    if (table === "Payment") {
        const payment = await prismadb.payment.findUnique({
            where: { id },
            select: { clientId: true, expenses: { select: { id: true } } }
        });

        if (payment) {
            // Delete associated expenses (e.g. VAT)
            if (payment.expenses && payment.expenses.length > 0) {
                for (const expense of payment.expenses) {
                    await prismadb.expense.delete({
                        where: { id: expense.id }
                    });

                    // Find and mark the log for this expense as undone
                    // We try to find a log created recently for this expense
                    const expenseLog = await prismadb.log.findFirst({
                        where: {
                            relatedId: expense.id,
                            relatedTable: "Expense",
                            action: "KDV Gideri Eklendi"
                        }
                    });

                    if (expenseLog) {
                        await prismadb.log.update({
                            where: { id: expenseLog.id },
                            data: { isUndone: true }
                        });
                    }
                }
            }

            revalidatePath(`/clients/${payment.clientId}`);
        }
    }

    // @ts-ignore
    await prismadb[modelName].delete({
        where: { id },
    });
}

async function restoreRecord(table: string, data: any) {
    const modelName = table.charAt(0).toLowerCase() + table.slice(1);

    // Special handling for Client restoration (Undo Delete)
    if (table === "Client") {
        const { services, payments, appointments, measurements, ...clientData } = data;

        // Clean client data
        const cleanClientData = Object.fromEntries(
            Object.entries(clientData).filter(([key, value]) => {
                if (key === 'id' || key === 'createdAt' || key === 'updatedAt') return false;
                if (typeof value === 'object' && value !== null && !(value instanceof Date)) return false;
                return true;
            })
        );

        // Prepare nested creates
        const nestedData: any = { ...cleanClientData };

        if (services && Array.isArray(services)) {
            nestedData.services = {
                create: services.map((s: any) => {
                    const { id, clientId, createdAt, updatedAt, ...rest } = s;
                    return rest;
                })
            };
        }

        if (measurements && Array.isArray(measurements)) {
            nestedData.measurements = {
                create: measurements.map((m: any) => {
                    const { id, clientId, createdAt, ...rest } = m;
                    return rest;
                })
            };
        }

        if (appointments && Array.isArray(appointments)) {
            nestedData.appointments = {
                create: appointments.map((a: any) => {
                    const { id, clientId, userId, createdAt, updatedAt, ...rest } = a;
                    return rest;
                })
            };
        }

        if (payments && Array.isArray(payments)) {
            nestedData.payments = {
                create: payments.map((p: any) => {
                    const { id, clientId, serviceId, expenses, createdAt, ...rest } = p;
                    // Handle nested expenses for payments
                    const paymentData: any = { ...rest };

                    if (expenses && Array.isArray(expenses)) {
                        paymentData.expenses = {
                            create: expenses.map((e: any) => {
                                const { id, paymentId, createdAt, ...eRest } = e;
                                return eRest;
                            })
                        };
                    }
                    return paymentData;
                })
            };
        }

        // @ts-ignore
        await prismadb.client.create({
            data: nestedData,
        });
        return;
    }

    // Clean data for create: keep ID to restore identity, remove relations and timestamps if needed (usually better to keep timestamps for restore, but relations must go)
    // Actually, let's remove relations.
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => {
            // Remove relations (objects/arrays) but allow Date objects and null
            if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
                return false;
            }
            return true;
        })
    );

    // Special handling for Appointment restoration (Undo Delete)
    if (table === "Appointment" && (data as any).serviceId) {
        const service = await prismadb.service.findUnique({
            where: { id: (data as any).serviceId },
        });

        if (service && service.remainingSessions > 0) {
            await prismadb.service.update({
                where: { id: (data as any).serviceId },
                data: {
                    remainingSessions: {
                        decrement: 1,
                    },
                },
            });
        }
    }

    // @ts-ignore
    await prismadb[modelName].create({
        data: cleanData,
    });
}

async function updateRecord(table: string, id: number, data: any) {
    const modelName = table.charAt(0).toLowerCase() + table.slice(1);

    // Clean data for update: remove ID, timestamps, and relations
    const { id: _, createdAt: __, updatedAt: ___, ...rest } = data;

    const cleanData = Object.fromEntries(
        Object.entries(rest).filter(([key, value]) => {
            // Remove relations (objects/arrays) but allow Date objects and null
            if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
                return false;
            }
            return true;
        })
    );

    // @ts-ignore
    await prismadb[modelName].update({
        where: { id },
        data: cleanData,
    });
}
