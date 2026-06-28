"use client";

import { useState, useTransition } from "react";
import { DayPicker } from "react-day-picker";
import { useLocale, useTranslations } from "next-intl";
import { fr, he, enUS } from "react-day-picker/locale";
import { cycleAvailability } from "@/features/availability/actions";
import { getDirection } from "@/i18n/config";
import { isoDay } from "@/lib/utils";
import "react-day-picker/style.css";

const dpLocales: Record<string, typeof enUS> = { fr, he, en: enUS, am: enUS };

type Day = { date: string; status: "AVAILABLE" | "UNAVAILABLE" | "BOOKED" };

export function AvailabilityManager({ initial }: { initial: Day[] }) {
  const t = useTranslations("admin.calendar");
  const locale = useLocale();
  const dir = getDirection(locale);
  const [days, setDays] = useState<Day[]>(initial);
  const [isPending, startTransition] = useTransition();

  const byStatus = (s: Day["status"]) =>
    days
      .filter((d) => d.status === s)
      .map((d) => new Date(`${d.date}T00:00:00Z`));

  function onDayClick(day: Date) {
    const iso = isoDay(day);
    const current = days.find((d) => d.date === iso);
    if (current?.status === "BOOKED") return; // managed via bookings

    // optimistic cycle: none → AVAILABLE → UNAVAILABLE → none
    const nextStatus: Record<string, Day["status"] | null> = {
      none: "AVAILABLE",
      AVAILABLE: "UNAVAILABLE",
      UNAVAILABLE: null,
    };
    const key = current?.status ?? "none";
    const next = nextStatus[key];

    setDays((prev) => {
      const others = prev.filter((d) => d.date !== iso);
      return next ? [...others, { date: iso, status: next }] : others;
    });

    startTransition(() => {
      cycleAvailability(iso);
    });
  }

  return (
    <div className="rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-ink/10 sm:p-7">
      <h2 className="display text-xl text-ink">{t("title")}</h2>
      <p className="mt-1.5 text-sm text-ink-soft/70">{t("subtitle")}</p>

      <div className="mt-5" aria-busy={isPending}>
        <DayPicker
          dir={dir}
          locale={dpLocales[locale] ?? enUS}
          onDayClick={onDayClick}
          modifiers={{
            available: byStatus("AVAILABLE"),
            unavailable: byStatus("UNAVAILABLE"),
            booked: byStatus("BOOKED"),
          }}
          modifiersClassNames={{
            available: "bg-secondary/15 text-secondary font-semibold rounded-lg",
            unavailable: "bg-ink/10 text-ink/40 line-through rounded-lg",
            booked: "bg-primary/15 text-primary font-semibold rounded-lg",
          }}
          startMonth={new Date()}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-sm">
        <Legend className="bg-secondary/15 text-secondary" label={t("available")} />
        <Legend className="bg-ink/10 text-ink/50" label={t("unavailable")} />
        <Legend className="bg-primary/15 text-primary" label={t("booked")} />
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block h-4 w-4 rounded ${className}`} />
      {label}
    </span>
  );
}
