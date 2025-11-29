import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
    matcher: [
        // Skip API routes and all static/public assets (images, fonts, manifest, service worker, etc.)
        "/((?!api|_next/static|_next/image|favicon.ico|site.webmanifest|manifest.webmanifest|robots.txt|sitemap.xml|sw.js|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml|css|js|map|json|woff|woff2|ttf|otf)).*)",
    ],
};
