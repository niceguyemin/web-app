"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import { createLog } from "@/lib/logger";

export async function createExpense(formData: FormData) {
    const category = formData.get("category") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const description = formData.get("description") as string;

    const expense = await prismadb.expense.create({
        data: {
            category,
            amount,
            description,
        },
    });

    await createLog("Gider Eklendi", `${category} - ${amount} TL - ${description}`, expense.id, "Expense", null);

    revalidatePath("/accounting");
}

export async function deleteExpense(id: number) {
    const expense = await prismadb.expense.findUnique({
        where: { id },
    });

    await prismadb.expense.delete({
        where: { id },
    });

    if (expense) {
        await createLog("Gider Silindi", `${expense.category} - ${expense.amount} TL`, id, "Expense", expense);
    }

    revalidatePath("/accounting");
}
