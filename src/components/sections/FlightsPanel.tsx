"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plane, X } from "lucide-react";
import { isoDay } from "@/lib/utils";

// Destination is fixed: Addis Ababa Bole (ADD), the gateway to Ethiopia.
const DEST = "Addis Ababa (ADD)";
const ORIGIN_PRESETS = ["TLV", "CDG", "JFK", "DXB"];

function googleFlightsUrl(origin: string, dateIso?: string) {
  const q =
    `flights to ${DEST}` +
    (origin ? ` from ${origin}` : "") +
    (dateIso ? ` on ${dateIso}` : "");
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
}

export function FlightsPanel({
  open,
  onClose,
  date,
  dir,
}: {
  open: boolean;
  onClose: () => void;
  date?: Date;
  dir: "ltr" | "rtl";
}) {
  const t = useTranslations("flights");
  const [origin, setOrigin] = useState("");

  const dateIso = date ? isoDay(date) : undefined;

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function search() {
    window.open(googleFlightsUrl(origin, dateIso), "_blank", "noopener");
  }

  const hiddenTransform =
    dir === "rtl" ? "translateX(-100%)" : "translateX(100%)";

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-ink/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        className="fixed inset-y-0 z-50 flex w-full max-w-md flex-col bg-surface shadow-2xl transition-transform duration-300"
        style={{
          insetInlineEnd: 0,
          transform: open ? "translateX(0)" : hiddenTransform,
        }}
      >
        <div className="tricolor h-1 w-full" aria-hidden />
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <h2 className="display flex items-center gap-2 text-xl text-ink">
            <Plane className="size-5 text-blue" />
            {t("title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="rounded-full p-2 text-ink/70 hover:bg-ink/5"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <p className="text-sm text-ink-soft/75">{t("subtitle")}</p>

          <label className="mt-6 flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-soft">
              {t("origin")}
            </span>
            <input
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              placeholder={t("originPlaceholder")}
              className="rounded-xl border border-ink/15 bg-cream px-3.5 py-2.5 text-ink outline-none focus:border-primary"
            />
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="self-center text-xs text-ink-soft/60">
              {t("presets")}:
            </span>
            {ORIGIN_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setOrigin(p)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  origin === p
                    ? "bg-blue text-cream"
                    : "bg-ink/5 text-ink/70 hover:bg-ink/10"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-xl bg-cream px-4 py-3 text-sm ring-1 ring-ink/10">
            <span className="text-ink-soft/60">{t("date")}: </span>
            <span className="font-semibold text-ink">
              {dateIso ?? "—"}
            </span>
          </div>

          <button
            type="button"
            onClick={search}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue px-5 py-3.5 font-semibold text-cream transition-opacity hover:opacity-90"
          >
            {t("search")}
          </button>
          <p className="mt-3 text-center text-xs text-ink-soft/55">
            {t("note")}
          </p>

          {/*
            NOTE — pourquoi un lien plutôt qu'un vrai embed :
            Google Flights bloque l'iframe (X-Frame-Options) et n'a pas de widget
            officiel. Pour garder l'utilisateur SUR le site, remplace ce bloc par
            un widget d'affiliation embarquable (Skyscanner / Travelpayouts) :
            il s'intègre en iframe ET génère une commission. Slot prêt ci-dessous.

            <div className="mt-6">
              <iframe title="flights" src="<affiliate-widget-url>" className="h-[480px] w-full rounded-xl" />
            </div>
          */}
        </div>
      </aside>
    </>
  );
}
