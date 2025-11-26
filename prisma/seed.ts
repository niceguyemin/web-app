import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Helper functions
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomColor(): string {
    const colors = ["#EF4444", "#F97316", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"];
    return colors[Math.floor(Math.random() * colors.length)];
}

async function main() {
    console.log("Seeding database with comprehensive test data...");

    // 1️⃣ Admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
        where: { username: "admin" },
        update: {},
        create: {
            username: "admin",
            password: adminPassword,
            role: "ADMIN",
            name: "Administrator",
            color: "#3B82F6",
        },
    });

    // 2️⃣ Expert users (Uzmanlar)
    const expertNames = ["Ayşe", "Mehmet"];
    const experts = [] as any[];
    for (const name of expertNames) {
        const username = name.toLowerCase();
        const password = await bcrypt.hash("123456", 10);
        const user = await prisma.user.upsert({
            where: { username },
            update: {},
            create: {
                username,
                password,
                role: "USER",
                name,
                color: randomColor(),
            },
        });
        experts.push(user);
    }

    // 3️⃣ Service types
    const serviceTypes = ["G8", "Online Danışmanlık", "Danışmanlık", "EMS", "Lenf Drenaj"];
    for (const type of serviceTypes) {
        await prisma.serviceType.upsert({
            where: { name: type },
            update: {},
            create: { name: type },
        });
    }

    // 4️⃣ Clients
    const clientNames = [
        "Ali Veli", "Fatma Yılmaz", "Ahmet Demir", "Ayşe Kara", "Mehmet Şahin",
        "Selma Çelik", "Hasan Öz", "Emine Kılıç", "Oğuzhan Güneş", "Derya Aksoy",
        "Sibel Arslan", "Kemal Koç", "Nisan Bay", "Baran Korkmaz", "Lale Aydın",
        "Cemre Yıldız", "Efe Taş", "Gülcan Erdem", "Hakan Yıldırım", "İrem Şimşek",
        "Murat Kaya", "Zehra Yılmaz", "Mustafa Çelik", "Hülya Demir", "İbrahim Koç",
        "Esra Şahin", "Burcu Aksoy", "Onur Güneş", "Seda Arslan", "Volkan Yıldız",
        "Yasemin Taş", "Gökhan Erdem", "Berna Yıldırım", "Serhat Şimşek", "Tuğba Kaya",
        "Uğur Yılmaz", "Pelin Çelik", "Cihan Demir", "Büşra Koç", "Fatih Şahin",
        "Merve Aksoy", "Okan Güneş", "Demet Arslan", "Sinan Yıldız", "Ebru Taş",
        "Kadir Erdem", "Gamze Yıldırım", "Yasin Şimşek", "Melis Kaya", "Tarık Yılmaz"
    ];

    const clients = [] as any[];
    for (const name of clientNames) {
        const client = await prisma.client.create({
            data: {
                name,
                gender: Math.random() > 0.5 ? "Male" : "Female",
                phone: `+90${randomInt(5000000000, 5999999999)}`,
                birthDate: `${randomInt(1970, 2000)}-01-01`,
                height: randomInt(150, 190),
                weight: randomInt(55, 100),
                notes: "Generated seed data",
            },
        });
        clients.push(client);
    }

    // 5️⃣ Services (per client)
    const services = [] as any[];
    for (const client of clients) {
        const type = serviceTypes[randomInt(0, serviceTypes.length - 1)];
        const totalSessions = randomInt(10, 30); // Increased sessions
        const totalPrice = totalSessions * randomInt(50, 150);
        const service = await prisma.service.create({
            data: {
                clientId: client.id,
                type,
                totalSessions,
                remainingSessions: totalSessions,
                totalPrice,
                status: "ACTIVE",
            },
        });
        services.push(service);
    }

    // 6️⃣ Appointments (mix of past, today, future)
    const appointments = [] as any[];
    const now = new Date();
    for (const service of services) {
        const numAppts = randomInt(8, 20); // Increased appointments per service
        for (let i = 0; i < numAppts; i++) {
            const date = randomDate(
                new Date(now.getFullYear() - 1, 0, 1),
                new Date(now.getFullYear() + 1, 11, 31)
            );
            const user = experts[randomInt(0, experts.length - 1)];
            const appt = await prisma.appointment.create({
                data: {
                    clientId: service.clientId,
                    serviceId: service.id,
                    userId: user.id,
                    date,
                    status: Math.random() > 0.9 ? "CANCELLED" : "SCHEDULED",
                    notes: "Seed appointment",
                },
            });
            appointments.push(appt);
        }
    }
    // Add a specific appointment for today (seed)
    const today = new Date();
    const todayService = services[0];
    const todayExpert = experts[0];
    const todayAppt = await prisma.appointment.create({
        data: {
            clientId: todayService.clientId,
            serviceId: todayService.id,
            userId: todayExpert.id,
            date: today,
            status: "SCHEDULED",
            notes: "Today's appointment (seed)",
        },
    });
    appointments.push(todayAppt);

    // 7️⃣ Payments (some paid, some pending)
    for (const service of services) {
        const paidCount = randomInt(0, service.totalSessions);
        const amountPerSession = service.totalPrice / service.totalSessions;
        for (let i = 0; i < paidCount; i++) {
            await prisma.payment.create({
                data: {
                    clientId: service.clientId,
                    serviceId: service.id,
                    amount: amountPerSession,
                    date: randomDate(new Date(now.getFullYear(), now.getMonth() - 2, 1), now),
                    type: "CASH",
                },
            });
        }
    }

    // 8️⃣ Expenses (random monthly expenses)
    const expenseCategories = ["Kira", "Elektrik", "Su", "İnternet", "Malzeme", "Reklam"];
    for (let i = 0; i < 30; i++) {
        await prisma.expense.create({
            data: {
                category: expenseCategories[randomInt(0, expenseCategories.length - 1)],
                amount: randomInt(200, 2000),
                description: "Seed expense",
                date: randomDate(new Date(now.getFullYear() - 1, 0, 1), now),
            },
        });
    }

    // 9️⃣ Measurements (one per client)
    for (const client of clients) {
        await prisma.measurement.create({
            data: {
                clientId: client.id,
                weight: randomInt(55, 100),
                height: randomInt(150, 190),
                bmi: parseFloat((randomInt(55, 100) / ((randomInt(150, 190) / 100) ** 2)).toFixed(1)),
                date: randomDate(new Date(now.getFullYear() - 1, 0, 1), now),
            },
        });
    }

    console.log("✅ Seed data generated successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
