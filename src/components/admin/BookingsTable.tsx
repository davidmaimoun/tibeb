"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { setBookingStatus } from "@/features/booking/actions";
import { cn } from "@/lib/utils";

type Status =
  | "PENDING"
  | "CONFIRMED"
  | "DECLINED"
  | "CANCELLED"
  | "COMPLETED";

export type BookingRow = {
  id: string;
  startDate: string; // ISO
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  numPeople: number;
  tourType: string | null;
  message: string | null;
  status: Status;
};

const statusStyles: Record<Status, string> = {
  PENDING: "bg-accent/20 text-ink",
  CONFIRMED: "bg-secondary/15 text-secondary",
  DECLINED: "bg-ink/10 text-ink/60",
  CANCELLED: "bg-ink/10 text-ink/60",
  COMPLETED: "bg-primary/12 text-primary-deep",
};

// Which actions make sense from each status.
const actionsFor: Record<Status, Array<{ to: Status; key: string }>> = {
  PENDING: [
    { to: "CONFIRMED", key: "confirm" },
    { to: "DECLINED", key: "decline" },
  ],
  CONFIRMED: [
    { to: "COMPLETED", key: "complete" },
    { to: "CANCELLED", key: "cancel" },
  ],
  DECLINED: [],
  CANCELLED: [],
  COMPLETED: [],
};

export function BookingsTable({ rows }: { rows: BookingRow[] }) {
  const t = useTranslations("admin.bookings");
  const labels = useTranslations("admin.statusLabels");
  const locale = useLocale();
  const [items, setItems] = useState(rows);
  const [isPending, startTransition] = useTransition();

  function update(id: string, to: Status) {
    setItems((prev) => prev.map((b) => (b.id === id ? { ...b, status: to } : b)));
    startTransition(() => {
      setBookingStatus(id, to);
    });
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] bg-surface p-7 text-ink-soft/70 ring-1 ring-ink/10">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] bg-surface p-2 ring-1 ring-ink/10 sm:p-3">
      <ul className="flex flex-col gap-2" aria-busy={isPending}>
        {items.map((b) => (
          <li
            key={b.id}
            className="rounded-2xl bg-cream p-4 ring-1 ring-ink/5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-ink">{b.clientName}</p>
                <p className="truncate text-sm text-ink-soft/70">
                  <a
                    href={`mailto:${b.clientEmail}`}
                    className="underline-offset-2 hover:underline"
                  >
                    {b.clientEmail}
                  </a>
                  {b.clientPhone ? ` · ${b.clientPhone}` : ""}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  statusStyles[b.status],
                )}
              >
                {labels(b.status)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-soft/80">
              <span>
                <span className="text-ink-soft/50">{t("date")}: </span>
                {fmt(b.startDate)}
              </span>
              <span>
                <span className="text-ink-soft/50">{t("people")}: </span>
                {b.numPeople}
              </span>
              {b.tourType ? (
                <span>
                  <span className="text-ink-soft/50">{t("tour")}: </span>
                  {b.tourType}
                </span>
              ) : null}
            </div>

            {b.message ? (
              <p className="mt-2 rounded-lg bg-ink/5 px-3 py-2 text-sm text-ink-soft/80">
                {b.message}
              </p>
            ) : null}

            {actionsFor[b.status].length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {actionsFor[b.status].map((a) => (
                  <button
                    key={a.to}
                    type="button"
                    disabled={isPending}
                    onClick={() => update(b.id, a.to)}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50",
                      a.to === "CONFIRMED" || a.to === "COMPLETED"
                        ? "bg-secondary text-cream hover:opacity-90"
                        : "bg-ink/10 text-ink hover:bg-ink/15",
                    )}
                  >
                    {t(a.key)}
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
