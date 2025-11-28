import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";

export async function createLog(
    action: string,
    details?: string,
    relatedId?: number,
    relatedTable?: string,
    previousData?: any
) {
    try {
        const session = await auth();
        // Cast session.user to any to access id, assuming it's available in the session
        const userId = (session?.user as any)?.id ? parseInt((session?.user as any).id) : undefined;

        await prismadb.log.create({
            data: {
                action,
                details,
                userId,
                relatedId,
                relatedTable,
                previousData: previousData ? JSON.stringify(previousData) : undefined,
            },
        });

        // Cleanup: Keep only the last 30 logs
        const logsToKeep = await prismadb.log.findMany({
            take: 30,
            orderBy: { createdAt: 'desc' },
            select: { id: true }
        });

        if (logsToKeep.length >= 30) {
            const idsToKeep = logsToKeep.map(log => log.id);
            await prismadb.log.deleteMany({
                where: {
                    id: {
                        notIn: idsToKeep
                    }
                }
            });
        }
    } catch (error) {
        console.error("Failed to create log:", error);
    }
}
