import prismadb from "@/lib/prismadb";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
    process.env.AUTH_SECRET || "bunu-kimse-tahmin-edemez-cok-gizli-sifre-123"
);

export async function POST(request: Request) {
    try {
        console.log("[login] POST request received");
        const body = await request.json();
        const { username, password } = body;

        console.log("[login] Credentials provided:", { username });

        if (!username || !password) {
            console.log("[login] Missing credentials");
            return NextResponse.json(
                { error: "Missing credentials" },
                { status: 400 }
            );
        }

        // Find user in database
        const user = await prismadb.user.findUnique({
            where: { username },
        });

        if (!user) {
            console.log("[login] User not found:", username);
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        console.log("[login] User found, verifying password");

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.log("[login] Password mismatch for user:", username);
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        console.log("[login] Password verified, creating token");

        // Create JWT token manually
        const token = await new SignJWT({
            id: user.id.toString(),
            name: user.name || user.username,
            email: user.username,
            role: user.role,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(secret);

        console.log("[login] Token created, setting cookie");

        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set("next-auth.session-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });

        console.log("[login] Success for user:", username);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[login] Error:", error);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
