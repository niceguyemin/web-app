import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkUser() {
    try {
        const user = await prisma.user.findUnique({
            where: { username: 'admin' },
        });

        if (!user) {
            console.log('User "admin" not found.');
            // Create the user if it doesn't exist
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await prisma.user.create({
                data: {
                    username: 'admin',
                    password: hashedPassword,
                    role: 'ADMIN',
                    name: 'Admin User',
                },
            });
            console.log('Created user "admin" with password "admin123".');
        } else {
            console.log('User "admin" found.');
            const isMatch = await bcrypt.compare('admin123', user.password);
            console.log('Password match for "admin123":', isMatch);

            if (!isMatch) {
                console.log('Updating password to "admin123"...');
                const hashedPassword = await bcrypt.hash('admin123', 10);
                await prisma.user.update({
                    where: { username: 'admin' },
                    data: { password: hashedPassword }
                });
                console.log('Password updated.');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
