"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeLabels, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

// Short codes for the compact (mobile navbar) variant.
const shortLabels: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  he: "עב",
  am: "አማ",
};

export function LanguageSwitcher({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={cn("flex flex-wrap items-center", compact ? "gap-0.5" : "gap-1", className)}
      role="group"
      aria-label="Language"
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          disabled={isPending}
          aria-current={l === locale ? "true" : undefined}
          aria-label={localeLabels[l]}
          title={localeLabels[l]}
          onClick={() =>
            startTransition(() => router.replace(pathname, { locale: l }))
          }
          className={cn(
            "rounded-full transition-colors",
            compact ? "px-2 py-1 text-xs font-semibold" : "px-3 py-1.5 text-sm",
            l === locale ? "bg-ink text-cream" : "text-ink/70 hover:bg-ink/10",
          )}
        >
          {compact ? shortLabels[l] : localeLabels[l]}
        </button>
      ))}
    </div>
  );
}