"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { useLocale, useTranslations } from "next-intl";
import { fr, he, enUS } from "react-day-picker/locale";
import { Plane, Send, Check } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { FlightsPanel } from "@/components/sections/FlightsPanel";
import { places } from "@/features/content/places";
import { getDirection } from "@/i18n/config";
import { isoDay } from "@/lib/utils";
import {
  requestBooking,
  type BookingFormState,
} from "@/features/booking/actions";
import "react-day-picker/style.css";

const dpLocales: Record<string, typeof enUS> = { fr, he, en: enUS, am: enUS };
const initialState: BookingFormState = { status: "idle" };

// Owner's WhatsApp (yours). Dedicated var, falls back to the public one.
const OWNER_WA = (
  process.env.NEXT_PUBLIC_OWNER_WHATSAPP ||
  process.env.NEXT_PUBLIC_WHATSAPP ||
  ""
).replace(/[^\d]/g, "");

export function BookingSection({ availableDays }: { availableDays: string[] }) {
  const t = useTranslations("booking");
  const tf = useTranslations("flights");
  const tPlaces = useTranslations("places.items");
  const locale = useLocale();
  const dir = getDirection(locale);

  const availableDates = useMemo(
    () => availableDays.map((d) => new Date(`${d}T00:00:00Z`)),
    [availableDays],
  );
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [selected, setSelected] = useState<Date | undefined>();
  const [flightsOpen, setFlightsOpen] = useState(false);
  const [waError, setWaError] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    requestBooking,
    initialState,
  );

  const prettyDate = (d: Date) =>
    d.toLocaleDateString(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // WhatsApp path: build a prefilled message to YOUR number. No DB write.
  function sendByWhatsapp() {
    const form = formRef.current;
    if (!form || !OWNER_WA) return;
    const fd = new FormData(form);
    const name = String(fd.get("clientName") ?? "").trim();
    const mail = String(fd.get("clientEmail") ?? "").trim();
    if (!name || !mail || !selected) {
      setWaError(true);
      return;
    }
    setWaError(false);
    const phone = String(fd.get("clientPhone") ?? "").trim();
    const people = String(fd.get("numPeople") ?? "1");
    const tourVal = String(fd.get("tourType") ?? "general");
    const tour =
      tourVal === "general" ? t("form.tourGeneral") : tPlaces(`${tourVal}.name`);
    const msg = String(fd.get("message") ?? "").trim();

    const body = [
      t("form.requestIntro"),
      "",
      `${t("form.name")}: ${name}`,
      `${t("form.email")}: ${mail}`,
      phone ? `${t("form.phone")}: ${phone}` : null,
      `${t("form.people")}: ${people}`,
      `${t("form.tourType")}: ${tour}`,
      `${t("selectedDay")}: ${prettyDate(selected)}`,
      msg ? `${t("form.message")}: ${msg}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(
      `https://wa.me/${OWNER_WA}?text=${encodeURIComponent(body)}`,
      "_blank",
      "noopener",
    );
  }

  return (
    <Section id="calendar" className="bg-cream-deep/40">
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-start">
        {/* Calendar */}
        <div className="rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-ink/10 sm:p-7">
          <DayPicker
            mode="single"
            dir={dir}
            locale={dpLocales[locale] ?? enUS}
            selected={selected}
            onSelect={setSelected}
            disabled={{ before: todayStart }}
            modifiers={{ available: availableDates }}
            modifiersClassNames={{ available: "font-semibold text-secondary" }}
            startMonth={new Date()}
          />
          <div className="mt-4 flex items-center gap-2 text-sm text-ink-soft/70">
            <span className="inline-block h-3 w-3 rounded-full bg-secondary" />
            {t("legendAvailable")}
          </div>

          <button
            type="button"
            onClick={() => setFlightsOpen(true)}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue/10 px-5 py-3 text-sm font-semibold text-blue transition-colors hover:bg-blue/15"
          >
            <Plane className="size-[18px]" />
            {tf("open")}
          </button>
        </div>

        {/* Form / success */}
        {state.status === "success" ? (
          <div className="flex flex-col items-start gap-3 rounded-[var(--radius-card)] bg-secondary/10 p-7 ring-1 ring-secondary/30">
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-secondary text-cream">
              <Check className="size-6" />
            </span>
            <h3 className="display text-2xl text-ink">{t("form.success")}</h3>
            {selected && (
              <p className="text-ink-soft">
                {t("selectedDay")}:{" "}
                <span className="font-semibold text-ink">
                  {prettyDate(selected)}
                </span>
              </p>
            )}
          </div>
        ) : (
          <form ref={formRef} action={formAction} className="flex flex-col gap-4">
            <input
              type="hidden"
              name="startDate"
              value={selected ? isoDay(selected) : ""}
            />
            <input type="hidden" name="locale" value={locale} />

            <div
              className={`rounded-2xl px-4 py-3 text-sm ring-1 transition-colors ${
                selected
                  ? "bg-secondary/10 ring-secondary/30"
                  : "bg-surface ring-ink/10"
              }`}
            >
              <span className="text-ink-soft/60">{t("selectedDay")}: </span>
              <span className="font-semibold text-ink">
                {selected ? prettyDate(selected) : t("form.pickDayFirst")}
              </span>
            </div>

            <Field name="clientName" label={t("form.name")} required />
            <Field
              name="clientEmail"
              label={t("form.email")}
              type="email"
              required
            />
            <Field name="clientPhone" label={t("form.phone")} type="tel" />

            {/* Travellers + Interested in — equal halves, label fits on one line */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink-soft">
                  {t("form.people")}
                </span>
                <input
                  name="numPeople"
                  type="number"
                  min={2}
                  max={80}
                  defaultValue="2"
                  className="rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-ink outline-none focus:border-primary"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink-soft">
                  {t("form.tourType")}
                </span>
                <select
                  name="tourType"
                  defaultValue="general"
                  className="rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-ink outline-none focus:border-primary"
                >
                  <option value="general">{t("form.tourGeneral")}</option>
                  {places.map((p) => (
                    <option key={p.key} value={p.key}>
                      {tPlaces(`${p.key}.name`)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink-soft">
                {t("form.message")}
              </span>
              <textarea
                name="message"
                rows={3}
                className="rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-ink outline-none focus:border-primary"
              />
            </label>

            {/* Two paths, client's choice */}
            <div className="mt-1 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={!selected || pending}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 font-semibold text-cream transition-colors hover:bg-primary-deep disabled:opacity-50"
              >
                <Send className="size-[18px]" />
                {pending ? t("form.submitting") : t("form.submit")}
              </button>
              {OWNER_WA && (
                <button
                  type="button"
                  onClick={sendByWhatsapp}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3.5 font-semibold text-cream transition-colors hover:bg-secondary-deep"
                >
                  <WhatsAppIcon />
                  {t("form.byWhatsapp")}
                </button>
              )}
            </div>

            {(state.status === "error" || waError) && (
              <p className="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary-deep">
                {waError
                  ? t("form.fillRequired")
                  : t(`form.${state.error ?? "errorGeneric"}`)}
              </p>
            )}
          </form>
        )}
      </div>

      <FlightsPanel
        open={flightsOpen}
        onClose={() => setFlightsOpen(false)}
        date={selected}
        dir={dir}
      />
    </Section>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink-soft">
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-ink outline-none focus:border-primary"
      />
    </label>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M.06 24l1.69-6.16a11.87 11.87 0 01-1.6-5.95C.16 5.34 5.5 0 12.06 0a11.82 11.82 0 018.41 3.49 11.82 11.82 0 013.49 8.41c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 01-5.7-1.45L.06 24zm6.6-3.8c1.68.99 3.28 1.59 5.4 1.59 5.45 0 9.9-4.43 9.9-9.89a9.86 9.86 0 00-9.89-9.9C6.6 1.99 2.16 6.43 2.16 11.9c0 2.22.65 3.88 1.74 5.62l-.99 3.62 3.75-.94zm11.39-5.46c-.07-.12-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42z" />
    </svg>
  );
}