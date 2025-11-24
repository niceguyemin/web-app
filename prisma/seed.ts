import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // Create default admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await prisma.user.upsert({
        where: { username: "admin" },
        update: {},
        create: {
            username: "admin",
            password: hashedPassword,
            role: "ADMIN",
            name: "Administrator",
        },
    });

    console.log(`Created admin user: ${admin.username}`);

    // Create default service types
    const defaultServices = ["G8", "Online Danışmanlık", "Danışmanlık", "EMS", "Lenf Drenaj"];

    for (const serviceName of defaultServices) {
        await prisma.serviceType.upsert({
            where: { name: serviceName },
            update: {},
            create: { name: serviceName },
        });
    }

    console.log("Created default service types");
    console.log("Seed completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
