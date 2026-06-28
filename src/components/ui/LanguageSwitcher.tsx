"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeLabels } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={cn("flex flex-wrap items-center gap-1", className)}
      role="group"
      aria-label="Language"
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          disabled={isPending}
          aria-current={l === locale ? "true" : undefined}
          onClick={() =>
            startTransition(() => router.replace(pathname, { locale: l }))
          }
          className={cn(
            "rounded-full px-3 py-1.5 text-sm transition-colors",
            l === locale
              ? "bg-ink text-cream"
              : "text-ink/70 hover:bg-ink/10",
          )}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  );
}
