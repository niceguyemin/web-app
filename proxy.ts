import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
    const { nextUrl, cookies } = req;

    // NextAuth session cookie'lerini kontrol et
    const sessionToken = cookies.get("next-auth.session-token");
    const secureSessionToken = cookies.get("__Secure-next-auth.session-token");
    const hasSession = sessionToken || secureSessionToken;

    console.log("[proxy] Path:", nextUrl.pathname);
    console.log("[proxy] Session token exists:", !!sessionToken);
    console.log("[proxy] Secure session token exists:", !!secureSessionToken);

    const isAuthRoute = nextUrl.pathname.startsWith("/login");

    // /login sayfası
    if (isAuthRoute) {
        // Zaten login'liyse ana sayfaya at
        if (hasSession) {
            console.log("[proxy] Authenticated user on /login, redirecting to /");
            return NextResponse.redirect(new URL("/", nextUrl));
        }
        console.log("[proxy] Unauthenticated user accessing /login");
        return NextResponse.next();
    }

    // Diğer tüm sayfalar için login zorunlu
    if (!hasSession) {
        console.log("[proxy] No session for protected route, redirecting to /login");
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    console.log("[proxy] Authenticated user accessing protected route");
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
