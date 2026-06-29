"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { Circle, Clock, CheckCircle2, MapPin } from "lucide-react";
import { setProgress } from "@/features/booking/actions";
import { cn } from "@/lib/utils";

type TimelineEntry = { label: string; at: string; kind: string };

export type GuideOrder = {
  id: string;
  startDate: string;
  numPeople: number;
  tourType: string | null;
  status: string;
  progress: string;
  timeline: TimelineEntry[];
};

const STEPS = ["PENDING", "IN_PROCESS", "DONE"] as const;
const stepLabel: Record<string, string> = {
  PENDING: "Pending",
  IN_PROCESS: "In process",
  DONE: "Done",
};

export function GuideBoard({ orders }: { orders: GuideOrder[] }) {
  const [items, setItems] = useState(orders);
  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] bg-surface p-7 text-ink-soft/70 ring-1 ring-ink/10">
        No orders assigned to you yet.
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-4">
      {items.map((o) => (
        <GuideCard
          key={o.id}
          order={o}
          onProgress={(p) =>
            setItems((prev) =>
              prev.map((x) => (x.id === o.id ? { ...x, progress: p } : x)),
            )
          }
        />
      ))}
    </ul>
  );
}

function GuideCard({
  order,
  onProgress,
}: {
  order: GuideOrder;
  onProgress: (p: string) => void;
}) {
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  const date = new Date(order.startDate).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const currentIdx = STEPS.indexOf(order.progress as (typeof STEPS)[number]);

  function advance(p: string) {
    onProgress(p);
    startTransition(() => setProgress(order.id, p));
  }

  return (
    <li className="rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-ink/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{date}</p>
          <p className="text-sm text-ink-soft/70">
            <MapPin className="mr-1 inline size-3.5" />
            {order.tourType && order.tourType !== "general"
              ? order.tourType
              : "Grand circuit"}{" "}
            · {order.numPeople} travellers
          </p>
        </div>
        <span className="rounded-full bg-ink/8 px-3 py-1 text-xs font-semibold text-ink/70">
          {order.status}
        </span>
      </div>

      {/* Progress stepper */}
      <div className="mt-4 flex items-center gap-2">
        {STEPS.map((s, i) => {
          const reached = i <= currentIdx;
          const Icon =
            i < currentIdx ? CheckCircle2 : i === currentIdx ? Clock : Circle;
          return (
            <button
              key={s}
              type="button"
              disabled={pending}
              onClick={() => advance(s)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50",
                reached
                  ? "bg-secondary text-cream"
                  : "bg-ink/8 text-ink/60 hover:bg-ink/15",
              )}
            >
              <Icon className="size-4" />
              {stepLabel[s]}
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      {order.timeline.length > 0 && (
        <ol className="mt-4 border-t border-ink/10 pt-3">
          {[...order.timeline]
            .sort((a, b) => +new Date(b.at) - +new Date(a.at))
            .map((e, i) => (
              <li key={i} className="flex items-start gap-3 py-1.5 text-sm">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-secondary" />
                <span className="text-ink">{e.label}</span>
                <span className="ml-auto whitespace-nowrap text-ink-soft/50">
                  {new Date(e.at).toLocaleString(locale, {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
        </ol>
      )}
    </li>
  );
}