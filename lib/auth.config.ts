import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prismadb from "@/lib/prismadb";

const isProduction = process.env.NODE_ENV === "production";

export const authConfig: NextAuthConfig = {
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    trustHost: true,
    providers: [
        Credentials({
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.username || !credentials?.password) {
                        return null;
                    }

                    const user = await prismadb.user.findUnique({
                        where: { username: credentials.username as string },
                    });

                    if (!user) {
                        return null;
                    }

                    const passwordMatch = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    );

                    if (!passwordMatch) {
                        return null;
                    }

                    return {
                        id: user.id.toString(),
                        name: user.name || user.username,
                        email: user.username,
                        role: user.role,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            try {
                if (user) {
                    token.role = (user as any)?.role || "USER";
                    token.id = (user as any)?.id;
                }
                return token;
            } catch (error) {
                console.error("JWT callback error:", error);
                return token;
            }
        },
        async session({ session, token }) {
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
    // Skip CSRF check for development
    skipCSRFCheck: !isProduction,
    // For localhost in development, explicitly allow the callback
    events: {
        async signIn({ user, isNewUser }) {
            console.log(`User ${user?.name} signed in`);
        },
    },
};
