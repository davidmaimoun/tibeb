"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { locales, localeMeta, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

// Préserve le chemin courant en changeant uniquement la locale.
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-sm text-ink transition-colors hover:bg-ink/5"
      >
        <Globe size={16} />
        <span className="leading-none">{localeMeta[locale].flag}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul className="absolute end-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-ink/10 bg-surface py-1 shadow-xl">
            {locales.map((l) => (
              <li key={l}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.replace(pathname, { locale: l });
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink transition-colors hover:bg-ink/5",
                    l === locale && "font-semibold text-primary",
                  )}
                >
                  <span className="text-base leading-none">{localeMeta[l].flag}</span>
                  <span>{localeMeta[l].label}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}