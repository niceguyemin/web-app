"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";

export async function createExpense(formData: FormData) {
    const category = formData.get("category") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const description = formData.get("description") as string;

    await prismadb.expense.create({
        data: {
            category,
            amount,
            description,
        },
    });

    revalidatePath("/accounting");
}

export async function deleteExpense(id: number) {
    await prismadb.expense.delete({
        where: { id },
    });
    revalidatePath("/accounting");
}
