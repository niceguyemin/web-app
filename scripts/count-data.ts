import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const clients = await prisma.client.count();
    const services = await prisma.service.count();
    const payments = await prisma.payment.count();
    const expenses = await prisma.expense.count();
    const serviceTypes = await prisma.serviceType.count();

    console.log(`Clients: ${clients}`);
    console.log(`Services: ${services}`);
    console.log(`Payments: ${payments}`);
    console.log(`Expenses: ${expenses}`);
    console.log(`ServiceTypes: ${serviceTypes}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
