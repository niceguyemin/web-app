import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ClientPushManager } from "@/components/push-manager";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DanışanTakip",
  description: "Danışan Takip ve Ön Muhasebe Uygulaması",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className={inter.className}>
        <Providers>
          <ClientPushManager />
          {children}
        </Providers>
      </body>
    </html>
  );
}
