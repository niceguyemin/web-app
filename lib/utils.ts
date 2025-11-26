import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "-";

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // If it starts with 90, remove it (we'll add +90 later)
  const withoutCountryCode = cleaned.startsWith("90") ? cleaned.slice(2) : cleaned;

  // Format as XXX XXX XXXX
  if (withoutCountryCode.length === 10) {
    return `+90 ${withoutCountryCode.slice(0, 3)} ${withoutCountryCode.slice(3, 6)} ${withoutCountryCode.slice(6)}`;
  }

  // If not 10 digits, just add +90 prefix
  return `+90 ${withoutCountryCode}`;
}
