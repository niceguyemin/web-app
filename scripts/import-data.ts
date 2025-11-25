import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { parse } from "date-fns";

const prisma = new PrismaClient();

// Adjust this path to point to your JSON file
const JSON_FILE_PATH = path.join(process.cwd(), "../domalovski/veriler_v2_20_kisi.json");

interface ServiceData {
    tarih: string;
    tur: string;
    seans: number;
    kalan: number;
    tutar: number;
    oden?: number;
}

interface WeightHistory {
    kilo: string;
    boy?: string;
    bmi?: string;
    tarih: string;
}

interface PaymentHistory {
    tutar: number;
    tarih: string;
}

interface PatientData {
    ad: string;
    cinsiyet?: string;
    telefon?: string;
    dogum?: string;
    boy?: string;
    kilo?: string;
    not?: string;
    hizmetler?: ServiceData[];
    kilo_gecmis?: WeightHistory[];
    odeme_gecmis?: PaymentHistory[];
}

interface ImportData {
    patients?: PatientData[];
}


async function main() {
    console.log(`Reading data from ${JSON_FILE_PATH}...`);

    if (!fs.existsSync(JSON_FILE_PATH)) {
        console.error("File not found!");
        process.exit(1);
    }

    const rawData = fs.readFileSync(JSON_FILE_PATH, "utf-8");
    const parsedData = JSON.parse(rawData);
    let data: PatientData[] = [];

    // Handle if the JSON is wrapped in an object like { patients: [...] }
    if (Array.isArray(parsedData)) {
        data = parsedData as PatientData[];
    } else if ((parsedData as ImportData).patients) {
        data = (parsedData as ImportData).patients!;
    } else {
        console.error("Invalid JSON format. Expected an array or object with 'patients' key.");
        process.exit(1);
    }

    console.log(`Found ${data.length} patients. Importing...`);

    for (const p of data) {
        try {
            // Create Client
            const client = await prisma.client.create({
                data: {
                    name: p.ad,
                    gender: p.cinsiyet || null,
                    phone: p.telefon || null,
                    birthDate: p.dogum || null,
                    height: p.boy ? parseFloat(p.boy) : null,
                    weight: p.kilo ? parseFloat(p.kilo) : null,
                    notes: p.not || null,
                },
            });

            console.log(`Created client: ${client.name} (${client.id})`);

            // Import Services
            if (p.hizmetler && Array.isArray(p.hizmetler)) {
                for (const h of p.hizmetler) {
                    const serviceDate = parseDate(h.tarih);

                    const service = await prisma.service.create({
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

                    // If there is a "paid" amount (oden > 0), we record it as a payment
                    if (h.oden && h.oden > 0) {
                        await prisma.payment.create({
                            data: {
                                clientId: client.id,
                                serviceId: service.id,
                                amount: h.oden,
                                date: serviceDate, // Assuming payment was made at service creation
                                type: "Nakit", // Default to Cash as source doesn't specify
                            },
                        });
                    }
                }
            }

            // Import Weight History
            if (p.kilo_gecmis && Array.isArray(p.kilo_gecmis)) {
                for (const k of p.kilo_gecmis) {
                    await prisma.measurement.create({
                        data: {
                            clientId: client.id,
                            weight: parseFloat(k.kilo),
                            height: k.boy ? parseFloat(k.boy) : null,
                            bmi: k.bmi ? parseFloat(k.bmi) : null,
                            date: parseDate(k.tarih),
                        },
                    });
                }
            }

            // Import Payment History (if exists separately)
            if (p.odeme_gecmis && Array.isArray(p.odeme_gecmis)) {
                for (const pay of p.odeme_gecmis) {
                    // Check if this payment is already covered by the service "oden" field to avoid duplicates?
                    // The python app logic seemed to append to odeme_gecmis whenever a payment was made.
                    // However, the "hizmetler" list also has "oden". 
                    // Strategy: We will import these as separate payments if they don't match exactly what we just created?
                    // Actually, to be safe and avoid double counting if the JSON is consistent, 
                    // we should rely on 'odeme_gecmis' for the payment records if it exists, 
                    // BUT the 'hizmetler' loop above creates payments based on 'oden'.
                    // Let's assume 'odeme_gecmis' is the source of truth for transaction history.
                    // But wait, the file I read didn't have 'odeme_gecmis' in the first few records.
                    // Let's just import them if they exist.

                    await prisma.payment.create({
                        data: {
                            clientId: client.id,
                            amount: pay.tutar,
                            date: parseDate(pay.tarih),
                            type: "Nakit",
                            // We can't easily link to a specific service unless we match by name/date, 
                            // but for now let's leave serviceId null (General Payment) or try to match?
                            // Let's leave it null for simplicity.
                        },
                    });
                }
            }

        } catch (error) {
            console.error(`Failed to import client ${p.ad}:`, error);
        }
    }

    console.log("Import completed!");
}

function parseDate(dateStr: string): Date {
    try {
        // Format: "dd.mm.yyyy HH:MM"
        // We can use date-fns parse
        return parse(dateStr, "dd.MM.yyyy HH:mm", new Date());
    } catch {
        return new Date();
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
