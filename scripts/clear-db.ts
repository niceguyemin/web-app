import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database cleanup...');

    try {
        // 1. Delete Appointments
        const appointments = await prisma.appointment.deleteMany({});
        console.log(`Deleted ${appointments.count} appointments`);

        // 2. Delete Payments
        const payments = await prisma.payment.deleteMany({});
        console.log(`Deleted ${payments.count} payments`);

        // 3. Delete Measurements
        const measurements = await prisma.measurement.deleteMany({});
        console.log(`Deleted ${measurements.count} measurements`);

        // 4. Delete Services
        const services = await prisma.service.deleteMany({});
        console.log(`Deleted ${services.count} services`);

        // 5. Delete Clients
        const clients = await prisma.client.deleteMany({});
        console.log(`Deleted ${clients.count} clients`);

        // 6. Delete Expenses
        const expenses = await prisma.expense.deleteMany({});
        console.log(`Deleted ${expenses.count} expenses`);

        // 7. Delete ServiceTypes
        const serviceTypes = await prisma.serviceType.deleteMany({});
        console.log(`Deleted ${serviceTypes.count} service types`);

        // 8. Delete Users except ADMIN
        const deletedUsers = await prisma.user.deleteMany({
            where: {
                role: {
                    not: 'ADMIN',
                },
            },
        });
        console.log(`Deleted ${deletedUsers.count} users (kept ADMINs)`);

        console.log('Database cleanup completed successfully.');
    } catch (error) {
        console.error('Error during database cleanup:', error);
        throw error;
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
