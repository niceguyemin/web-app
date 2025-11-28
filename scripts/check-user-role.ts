const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserRole() {
    try {
        const user = await prisma.user.findFirst({
            where: {
                username: 'beyza'
            }
        });

        if (user) {
            console.log(`User found: ${user.username}`);
            console.log(`Role: ${user.role}`);
        } else {
            console.log('User "beyza" not found.');
        }
    } catch (error) {
        console.error('Error checking user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUserRole();
