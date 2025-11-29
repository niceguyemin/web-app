"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
    phoneNumber: string;
    message: string;
    label?: string;
    className?: string;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon" | "touch";
}

export function WhatsAppButton({
    phoneNumber,
    message,
    label = "WhatsApp ile Gönder",
    className,
    variant = "default",
    size = "default"
}: WhatsAppButtonProps) {

    const handleClick = () => {
        // Remove non-numeric characters from phone number
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        // Ensure it starts with 90 if it's a Turkish number starting with 5
        const finalPhone = cleanPhone.startsWith('5') && cleanPhone.length === 10
            ? `90${cleanPhone}`
            : cleanPhone;

        const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <Button
            onClick={handleClick}
            className={cn("bg-[#25D366] hover:bg-[#128C7E] text-white", className)}
            variant={variant}
            size={size}
        >
            <MessageCircle className="mr-2 h-4 w-4" />
            {label}
        </Button>
    );
}
