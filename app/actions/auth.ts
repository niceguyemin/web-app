"use server";

import { signIn, signOut as authSignOut } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        console.log("Attempting to sign in with credentials...");
        // redirect: true is default. It will throw a NEXT_REDIRECT error on success.
        await signIn("credentials", formData);
    } catch (error) {
        // console.log("Sign in error:", error); // Commented out to reduce noise for redirect errors

        if (error instanceof AuthError) {
            console.error("AuthError caught:", error.type);
            switch (error.type) {
                case "CredentialsSignin":
                    return "Kullanıcı adı veya şifre hatalı.";
                default:
                    return "Bir hata oluştu.";
            }
        }

        // Rethrow the error if it's not an AuthError (e.g. redirect)
        throw error;
    }
}
export async function signOut() {
    await authSignOut({ redirectTo: "/login" });
}
