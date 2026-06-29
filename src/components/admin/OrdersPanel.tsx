"use client";

import { useMemo, useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { Mail, Send, UserCheck, UserPlus, Eye, Check, CalendarClock, Copy } from "lucide-react";
import {
  setBookingStatus,
  assignToGuide,
  sendClientEmail,
} from "@/features/booking/actions";
import {
  confirmAvailableEmail,
  proposeDatesEmail,
  confirmAvailableText,
  proposeDatesText,
} from "@/lib/email-templates";
import { TRIPS, DEFAULT_TRIP_CODE, getTrip, priceFor, usd } from "@/features/content/trip";
import { cn } from "@/lib/utils";

type Status = "PENDING" | "CONFIRMED" | "DECLINED" | "CANCELLED" | "COMPLETED";
const ALL_STATUS: Status[] = ["PENDING", "CONFIRMED", "DECLINED", "CANCELLED", "COMPLETED"];

export type OrderRow = {
  id: string;
  startDate: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  numPeople: number;
  tourType: string | null;
  message: string | null;
  status: Status;
  assignedToGuide: boolean;
  progress: string;
  paymentLink: string | null;
};

const statusStyles: Record<Status, string> = {
  PENDING: "bg-accent/20 text-ink",
  CONFIRMED: "bg-secondary/15 text-secondary",
  DECLINED: "bg-primary/12 text-primary-deep",
  CANCELLED: "bg-ink/10 text-ink/60",
  COMPLETED: "bg-blue/12 text-blue",
};

export function OrdersPanel({ rows }: { rows: OrderRow[] }) {
  const [items, setItems] = useState(rows);
  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] bg-surface p-7 text-ink-soft/70 ring-1 ring-ink/10">
        No requests yet.
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-4">
      {items.map((b) => (
        <OrderCard
          key={b.id}
          order={b}
          onChange={(patch) =>
            setItems((prev) => prev.map((x) => (x.id === b.id ? { ...x, ...patch } : x)))
          }
        />
      ))}
    </ul>
  );
}

function OrderCard({
  order,
  onChange,
}: {
  order: OrderRow;
  onChange: (patch: Partial<OrderRow>) => void;
}) {
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const [composer, setComposer] = useState<null | "confirm" | "propose">(null);

  const dateStr = useMemo(
    () =>
      new Date(order.startDate).toLocaleDateString(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [order.startDate, locale],
  );
  const quote = priceFor(getTrip(order.tourType), order.numPeople);

  function changeStatus(to: Status) {
    onChange({ status: to });
    startTransition(() => {
      void setBookingStatus(order.id, to);
    });
  }
  function toggleGuide() {
    const next = !order.assignedToGuide;
    onChange({ assignedToGuide: next });
    startTransition(() => {
      void assignToGuide(order.id, next);
    });
  }

  return (
    <li className="rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-ink/10">
      {/* Header: who + current status */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-ink">
            {order.clientName || "—"}
          </p>
          <p className="truncate text-sm text-ink-soft/70">
            <a href={`mailto:${order.clientEmail}`} className="underline-offset-2 hover:underline">
              {order.clientEmail}
            </a>
            {order.clientPhone ? ` · ${order.clientPhone}` : ""}
          </p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", statusStyles[order.status])}>
          {order.status}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-soft/80">
        <span>
          <span className="text-ink-soft/50">Date: </span>
          {dateStr}
        </span>
        <span>
          <span className="text-ink-soft/50">Travellers: </span>
          {order.numPeople}
        </span>
        <span>
          <span className="text-ink-soft/50">Quote: </span>
          {usd(quote.total)} · deposit {usd(quote.deposit)}
        </span>
      </div>

      {order.message ? (
        <p className="mt-2 rounded-lg bg-ink/5 px-3 py-2 text-sm text-ink-soft/80">
          <span className="text-ink-soft/50">Message: </span>
          {order.message}
        </p>
      ) : null}

      {/* Controls row: status + guide */}
      <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3 border-t border-ink/10 pt-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-soft/50">
            Status
          </span>
          <select
            value={order.status}
            disabled={pending}
            onChange={(e) => changeStatus(e.target.value as Status)}
            className="rounded-xl border border-ink/15 bg-cream px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-primary disabled:opacity-50"
          >
            {ALL_STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-soft/50">
            Guide
          </span>
          <button
            type="button"
            disabled={pending}
            onClick={toggleGuide}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-50",
              order.assignedToGuide ? "bg-blue/15 text-blue" : "bg-ink/10 text-ink hover:bg-ink/15",
            )}
          >
            {order.assignedToGuide ? (
              <>
                <UserCheck className="size-4" /> Assigned
              </>
            ) : (
              <>
                <UserPlus className="size-4" /> Assign to guide
              </>
            )}
          </button>
          <span className="max-w-56 text-xs text-ink-soft/50">
            Shows this order in the Guide view (progress only — no client contact).
          </span>
        </div>
      </div>

      {/* Email composer */}
      <div className="mt-4 border-t border-ink/10 pt-4">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-soft/50">
          Send a client email
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setComposer(composer === "confirm" ? null : "confirm")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              composer === "confirm" ? "bg-secondary text-cream" : "bg-secondary/12 text-secondary hover:bg-secondary/20",
            )}
          >
            <Mail className="size-4" /> Guide available
          </button>
          <button
            type="button"
            onClick={() => setComposer(composer === "propose" ? null : "propose")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              composer === "propose" ? "bg-ink text-cream" : "bg-accent/20 text-ink hover:bg-accent/30",
            )}
          >
            <CalendarClock className="size-4" /> Propose new dates
          </button>
        </div>

        {composer && (
          <EmailComposer
            kind={composer}
            order={order}
            dateStr={dateStr}
            onSent={() => setComposer(null)}
          />
        )}
      </div>
    </li>
  );
}

function EmailComposer({
  kind,
  order,
  dateStr,
  onSent,
}: {
  kind: "confirm" | "propose";
  order: OrderRow;
  dateStr: string;
  onSent: () => void;
}) {
  const [tripCode, setTripCode] = useState(DEFAULT_TRIP_CODE);
  const [paymentLink, setPaymentLink] = useState(order.paymentLink ?? "");
  const [altDates, setAltDates] = useState("");
  const [note, setNote] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const trip = getTrip(tripCode);
  const html = useMemo(() => {
    if (kind === "confirm") {
      return confirmAvailableEmail({
        clientName: order.clientName,
        numPeople: order.numPeople,
        dateStr,
        paymentLink,
        trip,
      }).html;
    }
    return proposeDatesEmail({
      clientName: order.clientName,
      dateStr,
      alternativeDates: altDates,
      note,
      trip,
    }).html;
  }, [kind, order, dateStr, paymentLink, altDates, note, trip]);

  const text = useMemo(() => {
    if (kind === "confirm") {
      return confirmAvailableText({
        clientName: order.clientName,
        numPeople: order.numPeople,
        dateStr,
        paymentLink,
        trip,
      });
    }
    return proposeDatesText({
      clientName: order.clientName,
      dateStr,
      alternativeDates: altDates,
      note,
      trip,
    });
  }, [kind, order, dateStr, paymentLink, altDates, note, trip]);

  const waDigits = (order.clientPhone || "").replace(/[^\d]/g, "");
  const [copied, setCopied] = useState(false);

  function sendWhatsapp() {
    const base = waDigits ? `https://wa.me/${waDigits}` : "https://wa.me/";
    window.open(`${base}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }
  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  function send() {
    startTransition(async () => {
      const res = await sendClientEmail({
        bookingId: order.id,
        kind,
        tripCode,
        paymentLink: kind === "confirm" ? paymentLink : undefined,
        alternativeDates: kind === "propose" ? altDates : undefined,
        note: kind === "propose" ? note : undefined,
      });
      if (res.ok) {
        setDone(true);
        setTimeout(onSent, 1200);
      }
    });
  }

  return (
    <div className="mt-3 rounded-2xl bg-cream p-4 ring-1 ring-ink/10">
      {/* Trip selector — ready for multiple trips */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink-soft">Trip</span>
        <select
          value={tripCode}
          onChange={(e) => setTripCode(e.target.value)}
          className="rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-ink outline-none focus:border-primary"
        >
          {TRIPS.map((tr) => (
            <option key={tr.code} value={tr.code}>
              {tr.title}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-3">
        {kind === "confirm" ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-soft">
              Deposit payment link (Grow, PayPal…)
            </span>
            <input
              value={paymentLink}
              onChange={(e) => setPaymentLink(e.target.value)}
              placeholder="https://grow.link/..."
              className="rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-ink outline-none focus:border-primary"
            />
          </label>
        ) : (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink-soft">Proposed alternative dates</span>
              <input
                value={altDates}
                onChange={(e) => setAltDates(e.target.value)}
                placeholder="e.g. 12–25 Oct, or 3–16 Nov"
                className="rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-ink outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink-soft">Personal note (optional)</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-ink outline-none focus:border-primary"
              />
            </label>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink/10 px-4 py-1.5 text-sm font-semibold text-ink hover:bg-ink/15"
        >
          <Eye className="size-4" /> {showPreview ? "Hide preview" : "Preview"}
        </button>
        <button
          type="button"
          disabled={pending || done || (kind === "confirm" ? !paymentLink : !altDates)}
          onClick={send}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-cream hover:bg-primary-deep disabled:opacity-50"
        >
          {done ? (
            <>
              <Check className="size-4" /> Sent
            </>
          ) : (
            <>
              <Send className="size-4" /> {pending ? "Sending…" : "Send email"}
            </>
          )}
        </button>
        <button
          type="button"
          disabled={kind === "confirm" ? !paymentLink : !altDates}
          onClick={sendWhatsapp}
          title={
            waDigits
              ? `Open WhatsApp to ${order.clientPhone}`
              : "Open WhatsApp and pick the contact"
          }
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-1.5 text-sm font-semibold text-cream hover:bg-secondary-deep disabled:opacity-50"
        >
          <WhatsAppIcon /> WhatsApp
        </button>
        <button
          type="button"
          onClick={copyText}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink/10 px-4 py-1.5 text-sm font-semibold text-ink hover:bg-ink/15"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy text"}
        </button>
      </div>
      {!waDigits && (
        <p className="mt-1.5 text-xs text-ink-soft/50">
          No phone on file — WhatsApp will open so you can pick the contact.
        </p>
      )}

      {showPreview && (
        <iframe
          title="email-preview"
          srcDoc={html}
          className="mt-3 h-[28rem] w-full rounded-lg border border-ink/10 bg-white"
        />
      )}
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M.06 24l1.69-6.16a11.87 11.87 0 01-1.6-5.95C.16 5.34 5.5 0 12.06 0a11.82 11.82 0 018.41 3.49 11.82 11.82 0 013.49 8.41c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 01-5.7-1.45L.06 24zm6.6-3.8c1.68.99 3.28 1.59 5.4 1.59 5.45 0 9.9-4.43 9.9-9.89a9.86 9.86 0 00-9.89-9.9C6.6 1.99 2.16 6.43 2.16 11.9c0 2.22.65 3.88 1.74 5.62l-.99 3.62 3.75-.94zm11.39-5.46c-.07-.12-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42z" />
    </svg>
  );
}