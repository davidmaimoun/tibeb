"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { loginAction } from "./actions";

export default function LoginPage() {
  const t = useTranslations("admin.login");
  const locale = useLocale();
  const [error, formAction, pending] = useActionState(
    loginAction.bind(null, locale),
    null,
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-baseline justify-center gap-2">
          <span className="display text-3xl font-bold text-ink">Tibeb</span>
          <span className="geez-mark text-2xl" aria-hidden>
            ጥበብ
          </span>
        </Link>

        <div className="mt-8 rounded-[var(--radius-card)] bg-surface p-7 ring-1 ring-ink/10">
          <h1 className="display text-2xl text-ink">{t("title")}</h1>
          <p className="mt-1.5 text-sm text-ink-soft/70">{t("subtitle")}</p>

          <form action={formAction} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink-soft">
                {t("email")}
              </span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="rounded-xl border border-ink/15 bg-cream px-3.5 py-2.5 text-ink outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink-soft">
                {t("password")}
              </span>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="rounded-xl border border-ink/15 bg-cream px-3.5 py-2.5 text-ink outline-none focus:border-primary"
              />
            </label>

            {error === "error" && (
              <p className="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary-deep">
                {t("error")}
              </p>
            )}

            <Button type="submit" size="lg" disabled={pending} className="mt-1">
              {pending ? t("submitting") : t("submit")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
