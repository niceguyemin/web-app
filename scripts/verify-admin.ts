import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Verifying admin user...");

    const adminUser = await prisma.user.findFirst({
        where: {
            role: "ADMIN"
        }
    });

    if (!adminUser) {
        console.log("❌ Admin user NOT found!");
        return;
    }

    console.log("✅ Admin user found:");
    console.log(`ID: ${adminUser.id}`);
    console.log(`Username: ${adminUser.username}`);
    console.log(`Role: ${adminUser.role}`);

    // Check password "admin123" (default)
    const isMatch = await bcrypt.compare("admin123", adminUser.password);
    console.log(`Password 'admin123' match: ${isMatch ? "YES" : "NO"}`);

    if (!isMatch) {
        // Check "123456"
        const isMatch2 = await bcrypt.compare("123456", adminUser.password);
        console.log(`Password '123456' match: ${isMatch2 ? "YES" : "NO"}`);
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
