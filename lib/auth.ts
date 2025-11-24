import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { jwtVerify } from "jose";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

const secret = new TextEncoder().encode(
    process.env.AUTH_SECRET || "bunu-kimse-tahmin-edemez-cok-gizli-sifre-123"
);

export async function verifyAuth(token: string) {
    try {
        const verified = await jwtVerify(token, secret);
        return verified.payload;
    } catch (error) {
        return null;
    }
}
