import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function GET() {
    try {
        const session = await auth();

        if ((session?.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const logs = await prismadb.log.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        username: true,
                        name: true,
                    }
                }
            }
        });

        return new NextResponse(JSON.stringify(logs, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="system-logs-${new Date().toISOString().split("T")[0]}.json"`,
            },
        });
    } catch (error) {
        console.error("[LOGS_EXPORT_ERROR]", error);
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
}
