import type { NextAuthConfig, User, Account, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const authConfig: NextAuthConfig = {
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    trustHost: true,
    providers: [], // Providers will be added in auth.ts to avoid Edge Runtime issues with Prisma
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = !nextUrl.pathname.startsWith("/login");

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                return Response.redirect(new URL("/", nextUrl));
            }
            return true;
        },
        async jwt({ token, user }: { token: JWT; user?: User; account?: Account | null }) {
            try {
                if (user) {
                    token.role = user.role || "USER";
                    token.id = user.id || "";
                }
                return token;
            } catch (error) {
                console.error("JWT callback error:", error);
                return token;
            }
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            try {
                if (session.user) {
                    session.user.role = (token.role as string) || "USER";
                    session.user.id = (token.id as string) || "";
                }
                return session;
            } catch (error) {
                console.error("Session callback error:", error);
                return session;
            }
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60,
    },
};
