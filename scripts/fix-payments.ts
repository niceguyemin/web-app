
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const paymentsWithoutService = await prisma.payment.findMany({
        where: {
            serviceId: null,
        },
        include: {
            client: {
                include: {
                    services: true
                }
            }
        }
    });

    console.log(`Found ${paymentsWithoutService.length} payments without service.`);

    let fixedCount = 0;

    for (const payment of paymentsWithoutService) {
        const services = payment.client.services;
        let targetServiceId: number | null = null;

        if (services.length === 0) {
            console.log(`Payment ${payment.id} has no services to link to.`);
            continue;
        }

        if (services.length === 1) {
            targetServiceId = services[0].id;
        } else {
            // Try to match by amount
            const matchingServices = services.filter(s => Math.abs(s.totalPrice - payment.amount) < 0.01);

            if (matchingServices.length === 1) {
                targetServiceId = matchingServices[0].id;
            } else if (matchingServices.length > 1) {
                // Multiple services with same price, pick the latest one created before payment? 
                // or just the latest one.
                // Let's pick the one with the latest createdAt
                matchingServices.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                targetServiceId = matchingServices[0].id;
            } else {
                // No match by amount, pick the latest service
                services.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                targetServiceId = services[0].id;
            }
        }

        if (targetServiceId) {
            await prisma.payment.update({
                where: { id: payment.id },
                data: { serviceId: targetServiceId }
            });
            fixedCount++;
        }
    }

    console.log(`Fixed ${fixedCount} payments.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
