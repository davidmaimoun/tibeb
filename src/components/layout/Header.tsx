"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const sections = [
  { id: "guide", key: "about" },
  { id: "places", key: "places" },
  { id: "gallery", key: "gallery" },
  { id: "calendar", key: "calendar" },
  { id: "contact", key: "contact" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  // On the home page use in-page anchors (smooth scroll + scroll-spy).
  // Elsewhere (e.g. the gallery page) link back to the home section.
  const hrefFor = (id: string) => (onHome ? `#${id}` : `/${locale}/#${id}`);

  // Scroll-spy: highlight the nav link for the section in view.
  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/85 backdrop-blur">
      <div className="tricolor h-1 w-full" aria-hidden />
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="display text-2xl font-bold text-ink">Tibeb</span>
          <span className="geez-mark text-xl" aria-hidden>
            ጥበብ
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {sections.map((s) => (
            <a
              key={s.id}
              href={hrefFor(s.id)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition-colors",
                active === s.id
                  ? "bg-secondary font-semibold text-cream"
                  : "text-ink/80 hover:bg-ink/5",
              )}
            >
              {t(s.key)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <ButtonLink href={hrefFor("calendar")} size="sm" className="pulse-soft">
            {t("book")}
          </ButtonLink>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            className="rounded-md p-2 text-ink"
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </Container>

      <div className={cn("lg:hidden", open ? "block" : "hidden")}>
        <Container className="flex flex-col gap-1 border-t border-ink/10 py-4">
          {sections.map((s) => (
            <a
              key={s.id}
              href={hrefFor(s.id)}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-lg px-3 py-2.5",
                active === s.id
                  ? "bg-secondary font-semibold text-cream"
                  : "text-ink/90 hover:bg-ink/5",
              )}
            >
              {t(s.key)}
            </a>
          ))}
          <ButtonLink
            href={hrefFor("calendar")}
            size="sm"
            className="mt-3"
            onClick={() => setOpen(false)}
          >
            {t("book")}
          </ButtonLink>
        </Container>
      </div>
    </header>
  );
}