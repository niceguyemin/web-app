import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🗑️ Clearing all push subscriptions...");

    try {
        const { count } = await prisma.pushSubscription.deleteMany({});
        console.log(`✅ Deleted ${count} subscriptions.`);
        console.log("🔄 Please refresh the page and re-enable notifications to subscribe with new keys.");
    } catch (error) {
        console.error("❌ Error clearing subscriptions:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
