"use client";

import { useActionState } from "react";
import { authenticate } from "@/app/actions/auth";
import Image from "next/image";

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

    return (
        <div
            className="
        min-h-screen 
        flex items-center justify-center 
        px-4
        bg-background-dark
        text-text-base
      "
        >
            {/* Neon Glow Effects */}
            <div className="pointer-events-none fixed inset-0 -z-10 flex items-center justify-center">
                <div className="absolute h-96 w-96 rounded-full bg-primary/20 blur-[128px]" />
                <div className="absolute h-64 w-64 rounded-full bg-secondary/20 blur-[96px] translate-x-1/2 translate-y-1/2" />
            </div>

            {/* Login Kartı */}
            <div className="w-full max-w-md card backdrop-blur-xl shadow-2xl p-8">
                {/* Logo alanı */}
                <div className="flex flex-col items-center gap-3 mb-8">
                    <div className="
            flex h-24 w-24 items-center justify-center 
            rounded-[2rem] bg-background-dark/50
            border border-white/10
            shadow-[0_0_30px_rgba(14,165,233,0.3)]
            overflow-hidden
            relative
          ">
                        {/* Inner Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-50" />
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            fill
                            className="object-cover z-10"
                            priority
                        />
                    </div>

                    <div className="text-center">
                        <h1 className="text-xl font-semibold tracking-tight text-text-heading">
                            Danışan Paneli
                        </h1>
                        <p className="mt-1 text-sm text-text-muted">
                            Danışanlarınızı, randevularınızı ve güzellik işlemlerini tek yerden yönetin.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form action={dispatch} className="space-y-4">
                    {errorMessage && (
                        <div className="bg-error/10 text-error p-3 rounded-xl text-sm border border-error/20 text-center">
                            {errorMessage}
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <label className="text-sm text-text-muted" htmlFor="username">
                            Kullanıcı Adı
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            className="
                w-full rounded-button border border-white/10 bg-background-dark/50 
                px-3.5 py-2.5 text-sm text-text-base 
                placeholder:text-text-muted/50
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                transition-all
              "
                            placeholder="admin"
                            defaultValue="admin"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm text-text-muted" htmlFor="password">
                            Şifre
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            className="
                w-full rounded-button border border-white/10 bg-background-dark/50 
                px-3.5 py-2.5 text-sm text-text-base 
                placeholder:text-text-muted/50
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                transition-all
              "
                            placeholder="******"
                            defaultValue="admin123"
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs text-text-muted">
                        <div className="flex items-center gap-2">
                            <input
                                id="remember"
                                type="checkbox"
                                className="h-3.5 w-3.5 rounded border-white/30 bg-transparent text-primary focus:ring-0"
                            />
                            <label htmlFor="remember" className="select-none">
                                Beni hatırla
                            </label>
                        </div>

                        <button
                            type="button"
                            className="text-[11px] underline underline-offset-2 hover:text-text-base transition-colors"
                        >
                            Şifremi unuttum
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full btn-primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)]"
                    >
                        {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </button>
                </form>

                {/* Alt bilgi */}
                <p className="mt-6 text-center text-[11px] text-text-muted">
                    Sağlık, güzellik ve danışan yönetimi için tasarlandı.
                </p>
            </div>
        </div>
    );
}
