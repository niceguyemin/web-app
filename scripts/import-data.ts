import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { parse } from "date-fns";

const prisma = new PrismaClient();
const JSON_FILE_PATH = path.join(__dirname, "../data.json");

interface ServiceData {
    tur: string;
    seans: number;
    kalan: number;
    tutar: number;
    oden: number;
    tarih: string;
}

interface WeightHistory {
    tarih: string;
    kilo: string | number;
    boy?: string | number;
    bmi?: string | number;
}

interface PaymentHistory {
    tarih: string;
    tur: string;
    tutar: number;
}

interface PatientData {
    ad: string;
    cinsiyet: string;
    telefon: string;
    dogum: string;
    boy: number | null;
    kilo: number | null;
    bmi: number | null;
    not: string;
    kilo_gecmis: WeightHistory[];
    hizmetler: ServiceData[];
    odeme_gecmis: PaymentHistory[];
}

interface ExpenseData {
    tarih: string;
    kategori: string;
    tutar: number;
    not: string;
}

interface ImportData {
    patients: PatientData[];
    expenses: ExpenseData[];
}

function parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    try {
        return parse(dateStr, "dd.MM.yyyy HH:mm", new Date());
    } catch (e) {
        return new Date();
    }
}

async function main() {
    if (!fs.existsSync(JSON_FILE_PATH)) {
        console.error("File not found!");
        process.exit(1);
    }

    const rawData = fs.readFileSync(JSON_FILE_PATH, "utf-8");
    const parsedData = JSON.parse(rawData) as ImportData;
    const patients = parsedData.patients || [];
    const expenses = parsedData.expenses || [];

    console.log(`Found ${patients.length} patients, ${expenses.length} expenses.`);

    for (const p of patients) {
        try {
            const client = await prisma.client.create({
                data: {
                    name: p.ad,
                    gender: p.cinsiyet || null,
                    phone: p.telefon || null,
                    birthDate: p.dogum || null,
                    height: p.boy ? parseFloat(p.boy.toString()) : null,
                    weight: p.kilo ? parseFloat(p.kilo.toString()) : null,
                    notes: p.not || null,
                },
            });

            if (p.hizmetler?.length) {
                for (const h of p.hizmetler) {
                    const serviceDate = parseDate(h.tarih);
                    const serviceTypeSlug = h.tur.trim();
                    if (serviceTypeSlug) {
                        await prisma.serviceType.upsert({
                            where: { name: serviceTypeSlug },
                            update: {},
                            create: { name: serviceTypeSlug, active: true }
                        });
                    }

                    await prisma.service.create({
                        data: {
                            clientId: client.id,
                            type: h.tur,
                            totalSessions: h.seans,
                            remainingSessions: h.kalan,
                            totalPrice: h.tutar,
                            createdAt: serviceDate,
                            status: h.kalan > 0 ? "ACTIVE" : "COMPLETED",
                        },
                    });
                }
            }

            if (p.kilo_gecmis?.length) {
                for (const k of p.kilo_gecmis) {
                    await prisma.measurement.create({
                        data: {
                            clientId: client.id,
                            weight: parseFloat(k.kilo.toString()),
                            height: k.boy ? parseFloat(k.boy.toString()) : null,
                            bmi: k.bmi ? parseFloat(k.bmi.toString()) : null,
                            date: parseDate(k.tarih),
                        },
                    });
                }
            }

            if (p.odeme_gecmis?.length) {
                for (const pay of p.odeme_gecmis) {
                    await prisma.payment.create({
                        data: {
                            clientId: client.id,
                            amount: pay.tutar,
                            date: parseDate(pay.tarih),
                            type: "Nakit",
                        },
                    });
                }
            }
        } catch (error) {
            console.error(`Failed client ${p.ad}:`, error);
        }
    }

    for (const e of expenses) {
        try {
            await prisma.expense.create({
                data: {
                    category: e.kategori,
                    amount: e.tutar,
                    description: e.not || null,
                    date: parseDate(e.tarih),
                },
            });
        } catch (error) {
            console.error("Failed expense:", error);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
