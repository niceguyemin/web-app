import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Giriş - Danışan Takip Sistemi",
    description: "Danışan Takip ve Ön Muhasebe Uygulaması",
};

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
        </>
    );
}
