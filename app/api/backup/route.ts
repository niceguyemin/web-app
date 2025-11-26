import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { google } from "googleapis";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

type ServiceAccountKey = {
    client_email?: string;
    private_key?: string;
    project_id?: string;
};

async function buildBackup() {
    const [users, clients, appointments, payments, serviceTypes, expenses, measurements, services] = await Promise.all([
        prismadb.user.findMany(),
        prismadb.client.findMany(),
        prismadb.appointment.findMany(),
        prismadb.payment.findMany(),
        prismadb.serviceType.findMany(),
        prismadb.expense.findMany(),
        prismadb.measurement.findMany(),
        prismadb.service.findMany(),
    ]);

    return {
        timestamp: new Date().toISOString(),
        version: "1.0",
        data: {
            users,
            clients,
            appointments,
            payments,
            serviceTypes,
            expenses,
            measurements,
            services,
        },
    };
}

function getServiceAccountKey(): ServiceAccountKey {
    const envKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (envKey) {
        try {
            return JSON.parse(envKey);
        } catch {
            try {
                const decoded = Buffer.from(envKey, "base64").toString("utf-8");
                return JSON.parse(decoded);
            } catch (error) {
                console.error("[BACKUP_ENV_KEY_PARSE_ERROR]", error);
                throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY env is not valid JSON/base64 JSON");
            }
        }
    }

    const keyPath = path.join(process.cwd(), "service-account-key.json");
    if (fs.existsSync(keyPath)) {
        const file = fs.readFileSync(keyPath, "utf-8");
        return JSON.parse(file);
    }

    throw new Error("Service account key not found. Provide GOOGLE_SERVICE_ACCOUNT_KEY or service-account-key.json");
}

export async function GET() {
    try {
        const session = await auth();

        if ((session?.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const backup = await buildBackup();

        return new NextResponse(JSON.stringify(backup, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="backup-${new Date().toISOString().split("T")[0]}.json"`,
            },
        });
    } catch (error) {
        console.error("[BACKUP_ERROR]", error);
        return NextResponse.json({ error: "Backup failed" }, { status: 500 });
    }
}

export async function POST() {
    try {
        const session = await auth();

        if ((session?.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const backup = await buildBackup();
        const fileContent = JSON.stringify(backup, null, 2);
        const credentials = getServiceAccountKey();

        const authClient = new google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/drive.file"],
        });

        const drive = google.drive({ version: "v3", auth: authClient });
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID ?? "1A18ye1MUnSZxaaelUUfo4am5GbvL-gNn";
        const filename = `danisan-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;

        const uploadedFile = await drive.files.create({
            requestBody: {
                name: filename,
                mimeType: "application/json",
                parents: folderId ? [folderId] : undefined,
            },
            media: {
                mimeType: "application/json",
                body: Readable.from(fileContent),
            },
            fields: "id, name, webViewLink, webContentLink",
            supportsAllDrives: true,
        });

        return NextResponse.json({
            id: uploadedFile.data.id,
            name: uploadedFile.data.name,
            webViewLink: uploadedFile.data.webViewLink,
            webContentLink: uploadedFile.data.webContentLink,
        });
    } catch (error) {
        console.error("[BACKUP_DRIVE_ERROR]", error);
        return NextResponse.json({ error: "Drive backup failed" }, { status: 500 });
    }
}
