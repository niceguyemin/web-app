import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Analyzing session data...");

    const appointments = await prisma.appointment.findMany({
        where: {
            status: {
                in: ["COMPLETED", "SCHEDULED"]
            }
        },
        select: {
            date: true,
            status: true,
        },
    });

    const completedByMonth: Record<string, number> = {};
    const scheduledByMonth: Record<string, number> = {};
    const totalByMonth: Record<string, number> = {};

    appointments.forEach((app) => {
        const date = new Date(app.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (app.status === "COMPLETED") {
            completedByMonth[monthKey] = (completedByMonth[monthKey] || 0) + 1;
        } else if (app.status === "SCHEDULED") {
            scheduledByMonth[monthKey] = (scheduledByMonth[monthKey] || 0) + 1;
        }

        totalByMonth[monthKey] = (totalByMonth[monthKey] || 0) + 1;
    });

    // Find max for each category
    const findMax = (data: Record<string, number>) => {
        let max = 0;
        let month = "";
        Object.entries(data).forEach(([m, c]) => {
            if (c > max) {
                max = c;
                month = m;
            }
        });
        return { max, month };
    };

    const maxCompleted = findMax(completedByMonth);
    const maxScheduled = findMax(scheduledByMonth);
    const maxTotal = findMax(totalByMonth);

    console.log("\n--- Analysis Result ---");
    console.log(`Max COMPLETED sessions in a month: ${maxCompleted.max} (${maxCompleted.month || "None"})`);
    console.log(`Max SCHEDULED sessions in a month: ${maxScheduled.max} (${maxScheduled.month || "None"})`);
    console.log(`Max TOTAL (Completed + Scheduled) sessions in a month: ${maxTotal.max} (${maxTotal.month || "None"})`);
    console.log("-----------------------\n");

    console.log("Detailed breakdown (Total):");
    console.table(totalByMonth);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
