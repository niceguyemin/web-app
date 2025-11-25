import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { jwtVerify } from "jose";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prismadb from "@/lib/prismadb";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.username || !credentials?.password) {
                        console.log("Missing credentials");
                        return null;
                    }

                    console.log("Authorizing user:", credentials.username);

                    const user = await prismadb.user.findUnique({
                        where: { username: credentials.username as string },
                    });

                    if (!user) {
                        console.log("User not found");
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
});

const secret = new TextEncoder().encode(
    process.env.AUTH_SECRET || "bunu-kimse-tahmin-edemez-cok-gizli-sifre-123"
);

export async function verifyAuth(token: string) {
    try {
        const verified = await jwtVerify(token, secret);
        return verified.payload;
    } catch {
        return null;
    }
}
