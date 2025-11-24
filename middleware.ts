import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const { nextUrl, cookies } = req;

    // NextAuth session cookie'lerini kontrol et
    const hasSession =
        cookies.get("next-auth.session-token") ||
        cookies.get("__Secure-next-auth.session-token");

    const isAuthRoute = nextUrl.pathname.startsWith("/login");

    // /login sayfası
    if (isAuthRoute) {
        // Zaten login'liyse ana sayfaya at
        if (hasSession) {
            return NextResponse.redirect(new URL("/", nextUrl));
        }
        return NextResponse.next();
    }

    // Diğer tüm sayfalar için login zorunlu
    if (!hasSession) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};