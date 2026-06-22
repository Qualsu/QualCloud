import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { translate } from "@/config/i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function base64Encode(value: string): string {
  try {
    const bytes = new TextEncoder().encode(value);
    const bin = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
    return btoa(bin);
  } catch {
    return "";
  }
}

export function base64Decode(value: string): string {
  try {
    const bin = atob(decodeURIComponent(value));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    try {
      const bin = atob(value);
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch {
      return "";
    }
  }
}

export function formatTimeRemaining(
  seconds: number,
  language: "ru" | "en" = "ru"
): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) {
    if (hours > 0) return translate(language, "timeRemaining.daysHours", { days, hours });
    return translate(language, "timeRemaining.days", { days });
  }
  if (hours > 0) {
    if (minutes > 0) return translate(language, "timeRemaining.hoursMinutes", { hours, minutes });
    return translate(language, "timeRemaining.hours", { hours });
  }
  if (minutes > 0) return translate(language, "timeRemaining.minutes", { minutes });
  return translate(language, "timeRemaining.lessThanMinute");
}
