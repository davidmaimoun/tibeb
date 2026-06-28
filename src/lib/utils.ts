// Tiny className concatenator (no clsx dependency needed).
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

// Normalize a date to midnight UTC so day comparisons are stable across zones.
export function toUtcDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function isoDay(date: Date): string {
  return toUtcDay(date).toISOString().slice(0, 10);
}

// Build contact links from public env vars.
export function contactChannels() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP ?? "";
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
  return {
    phone,
    email,
    whatsappUrl: phone
      ? `https://wa.me/${phone.replace(/[^0-9]/g, "")}`
      : undefined,
    mailto: email ? `mailto:${email}` : undefined,
  };
}
