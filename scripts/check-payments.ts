
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

    console.log(`Payments without serviceId: ${paymentsWithoutService.length}`);
    if (paymentsWithoutService.length > 0) {
        console.log("Sample:", paymentsWithoutService[0]);
    }

    let singleServiceCount = 0;
    let multipleServiceCount = 0;
    let noServiceCount = 0;

    let matchCount = 0;

    for (const payment of paymentsWithoutService) {
        const services = payment.client.services;
        if (services.length > 1) {
            const matchingService = services.find(s => Math.abs(s.totalPrice - payment.amount) < 0.01);
            if (matchingService) {
                matchCount++;
            }
        }
    }

    console.log(`Payments with >1 services but matching amount: ${matchCount}`);

    const paymentsWithServiceButNoType = await prisma.payment.findMany({
        where: {
            serviceId: {
                not: null,
            },
            service: {
                type: "", // Assuming type shouldn't be empty
            }
        },
        include: {
            service: true
        }
    });

    console.log(`Payments with service but empty type: ${paymentsWithServiceButNoType.length}`);

    // Check if there are payments where serviceId is set but service doesn't exist (should be impossible with FKs but good to check)
    // Prisma handles this via relations, so we can check if service is null when including it
    const paymentsWithOrphanedServiceId = await prisma.payment.findMany({
        where: {
            serviceId: { not: null }
        },
        include: { service: true }
    });

    const orphaned = paymentsWithOrphanedServiceId.filter(p => !p.service);
    console.log(`Payments with orphaned serviceId: ${orphaned.length}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
