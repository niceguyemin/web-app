"use client";

import { useActionState } from "react";
import { authenticate } from "@/app/actions/auth";

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

    return (
        <div
            className="
        min-h-screen 
        flex items-center justify-center 
        px-4
        bg-[radial-gradient(circle_at_top,_#0EA5E9_0,_#020617_55%,_#000000_100%)]
        text-white
      "
        >
            {/* Hafif parlayan blur daireler */}
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#22C55E]/20 blur-3xl" />
                <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-[#0EA5E9]/30 blur-3xl" />
            </div>

            {/* Login Kartı */}
            <div className="w-full max-w-md rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl p-8">
                {/* Logo alanı */}
                <div className="flex flex-col items-center gap-3 mb-8">
                    <div className="
            flex h-24 w-24 items-center justify-center 
            rounded-[2rem] bg-[#020617]/70 
            border border-white/10
            shadow-[0_0_25px_rgba(14,165,233,0.7)]
            overflow-hidden
          ">
                        <img src="/logo.png" alt="Logo" className="object-cover w-full h-full" />
                    </div>

                    <div className="text-center">
                        <h1 className="text-xl font-semibold tracking-tight">
                            Danışan Paneli
                        </h1>
                        <p className="mt-1 text-sm text-gray-300/80">
                            Danışanlarınızı, randevularınızı ve güzellik işlemlerini tek yerden yönetin.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form action={dispatch} className="space-y-4">
                    {errorMessage && (
                        <div className="bg-red-500/10 text-red-200 p-3 rounded-xl text-sm border border-red-500/20 text-center">
                            {errorMessage}
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <label className="text-sm text-gray-200" htmlFor="username">
                            Kullanıcı Adı
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            className="
                w-full rounded-2xl border border-white/15 bg-white/5 
                px-3.5 py-2.5 text-sm text-white 
                placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent
              "
                            placeholder="admin"
                            defaultValue="admin"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm text-gray-200" htmlFor="password">
                            Şifre
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            className="
                w-full rounded-2xl border border-white/15 bg-white/5 
                px-3.5 py-2.5 text-sm text-white 
                placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent
              "
                            placeholder="******"
                            defaultValue="admin123"
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-300/80">
                        <div className="flex items-center gap-2">
                            <input
                                id="remember"
                                type="checkbox"
                                className="h-3.5 w-3.5 rounded border-white/30 bg-transparent text-[#0EA5E9] focus:ring-0"
                            />
                            <label htmlFor="remember" className="select-none">
                                Beni hatırla
                            </label>
                        </div>

                        <button
                            type="button"
                            className="text-[11px] underline underline-offset-2 hover:text-white"
                        >
                            Şifremi unuttum
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="
              mt-4 w-full rounded-2xl 
              bg-[#0EA5E9] 
              px-4 py-2.5 text-sm font-medium 
              text-white shadow-lg
              hover:bg-[#0284C7]
              transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
                    >
                        {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </button>
                </form>

                {/* Alt bilgi */}
                <p className="mt-6 text-center text-[11px] text-gray-400">
                    Sağlık, güzellik ve danışan yönetimi için tasarlandı.
                </p>
            </div>
        </div>
    );
}
