import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        console.log("[logout] POST request received");
        
        const cookieStore = await cookies();
        const isProduction = process.env.NODE_ENV === "production";
        
        // Delete session cookie
        const deleteOptions: any = {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax" as const,
            maxAge: 0,
            path: "/",
        };
        
        // Extract domain from NEXTAUTH_URL for production
        if (isProduction && process.env.NEXTAUTH_URL) {
            try {
                const url = new URL(process.env.NEXTAUTH_URL);
                deleteOptions.domain = url.hostname;
            } catch (e) {
                console.error("[logout] Error parsing NEXTAUTH_URL for domain:", e);
            }
        }
        
        cookieStore.set("next-auth.session-token", "", deleteOptions);
        
        console.log("[logout] Session cookie deleted");
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[logout] Error:", error);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
