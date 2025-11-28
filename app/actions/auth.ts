"use server";

import { signIn, signOut as authSignOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        console.log("Attempting to sign in with credentials...");

        // Handle login without throwing to the client; redirect manually on success.
        const username = formData.get("username");
        const password = formData.get("password");

        if (typeof username !== "string" || typeof password !== "string") {
            return "Kullanıcı adı veya şifre eksik.";
        }

        const result = await signIn("credentials", {
            username,
            password,
            redirectTo: "/",
            redirect: false,
        });

        if (typeof result === "object" && result?.error) {
            return "Kullanıcı adı veya şifre hatalı.";
        }

        // Always send user to dashboard on successful login to avoid host mismatches.
        redirect("/");
    } catch (error) {
        // console.log("Sign in error:", error); // Commented out to reduce noise for redirect errors

        if (error instanceof AuthError) {
            console.error("AuthError caught:", error.type);
            switch (error.type) {
                case "CredentialsSignin":
                    return "Kullanıcı adı veya şifre hatalı.";
                case "CallbackRouteError":
                    return "Giriş sırasında yönlendirme hatası oluştu.";
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
