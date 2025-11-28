"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme()

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-black/80 group-[.toaster]:backdrop-blur-xl group-[.toaster]:border-white/10 group-[.toaster]:text-white group-[.toaster]:rounded-xl group-[.toaster]:shadow-2xl",
                    description: "group-[.toast]:text-white/50",
                    actionButton:
                        "group-[.toast]:bg-primary group-[.toast]:text-white",
                    cancelButton:
                        "group-[.toast]:bg-white/10 group-[.toast]:text-white",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
