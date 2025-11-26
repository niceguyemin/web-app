import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const JSON_FILE_PATH = path.join(__dirname, "../data.json");

async function main() {
    if (!fs.existsSync(JSON_FILE_PATH)) {
        console.error("data.json not found!");
        return;
    }

    const rawData = fs.readFileSync(JSON_FILE_PATH, "utf-8");
    const data = JSON.parse(rawData);
    const patients = data.patients || [];
    const expenses = data.expenses || [];

    let jsonServiceCount = 0;
    let jsonPaymentCount = 0;
    let jsonMeasurementCount = 0;

    patients.forEach((p: any) => {
        if (p.hizmetler) jsonServiceCount += p.hizmetler.length;
        if (p.odeme_gecmis) jsonPaymentCount += p.odeme_gecmis.length;
        if (p.kilo_gecmis) jsonMeasurementCount += p.kilo_gecmis.length;
    });

    const dbClientCount = await prisma.client.count();
    const dbServiceCount = await prisma.service.count();
    const dbPaymentCount = await prisma.payment.count();
    const dbExpenseCount = await prisma.expense.count();
    const dbMeasurementCount = await prisma.measurement.count();

    console.log("--- Data Verification ---");
    console.log(`Patients:     JSON=${patients.length}, DB=${dbClientCount} ${patients.length === dbClientCount ? "✅" : "❌"}`);
    console.log(`Services:     JSON=${jsonServiceCount}, DB=${dbServiceCount} ${jsonServiceCount === dbServiceCount ? "✅" : "❌"}`);
    console.log(`Payments:     JSON=${jsonPaymentCount}, DB=${dbPaymentCount} ${jsonPaymentCount === dbPaymentCount ? "✅" : "❌"}`);
    console.log(`Expenses:     JSON=${expenses.length}, DB=${dbExpenseCount} ${expenses.length === dbExpenseCount ? "✅" : "❌"}`);
    console.log(`Measurements: JSON=${jsonMeasurementCount}, DB=${dbMeasurementCount} ${jsonMeasurementCount === dbMeasurementCount ? "✅" : "❌"}`);

    if (patients.length !== dbClientCount) {
        // Find missing clients
        const dbClients = await prisma.client.findMany({ select: { name: true } });
        const dbNames = new Set(dbClients.map(c => c.name));
        const missing = patients.filter((p: any) => !dbNames.has(p.ad));
        console.log("Missing Clients:", missing.map((p: any) => p.ad));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
