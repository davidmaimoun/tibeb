"use client";

import { useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { useLocale, useTranslations } from "next-intl";
import { fr, he, enUS } from "react-day-picker/locale";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Plane } from "lucide-react";
import { FlightsPanel } from "@/components/sections/FlightsPanel";
import { createBooking } from "@/features/booking/actions";
import { getDirection } from "@/i18n/config";
import { isoDay } from "@/lib/utils";
import "react-day-picker/style.css";

const dpLocales: Record<string, typeof enUS> = { fr, he, en: enUS, am: enUS };

type Status = "idle" | "submitting" | "success" | "error" | "errorDay";

export function BookingSection({ availableDays }: { availableDays: string[] }) {
  const t = useTranslations("booking");
  const tf = useTranslations("flights");
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
  const [status, setStatus] = useState<Status>("idle");
  const [flightsOpen, setFlightsOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Selecting a day auto-updates the form; on small screens, bring it into view.
  function onSelect(day: Date | undefined) {
    setSelected(day);
    if (day && typeof window !== "undefined") {
      if (window.matchMedia("(max-width: 1024px)").matches) {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  async function handleSubmit(formData: FormData) {
    if (!selected) return;
    setStatus("submitting");

    const result = await createBooking({
      startDate: isoDay(selected),
      clientName: String(formData.get("clientName") ?? ""),
      clientEmail: String(formData.get("clientEmail") ?? ""),
      clientPhone: String(formData.get("clientPhone") ?? ""),
      numPeople: Number(formData.get("numPeople") ?? 1),
      tourType: String(formData.get("tourType") ?? ""),
      message: String(formData.get("message") ?? ""),
      locale,
    });

    if (result.ok) {
      setStatus("success");
      setSelected(undefined);
    } else {
      setStatus(result.error === "day_unavailable" ? "errorDay" : "error");
    }
  }

  return (
    <Section
      id="calendar"
      className="bg-cream-deep/40"
      bgImage="/images/texture/calendar.jpg"
    >
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-start">
        {/* Calendar — always visible. Past days disabled; open days highlighted. */}
        <div className="rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-ink/10 sm:p-7">
          <DayPicker
            mode="single"
            dir={dir}
            locale={dpLocales[locale] ?? enUS}
            selected={selected}
            onSelect={onSelect}
            disabled={{ before: todayStart }}
            modifiers={{ available: availableDates }}
            modifiersClassNames={{
              available: "font-semibold text-secondary",
            }}
            startMonth={new Date()}
          />
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-soft/70">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-secondary" />
              {t("legendAvailable")}
            </span>
          </div>

          {/* Flights helper */}
          <button
            type="button"
            onClick={() => setFlightsOpen(true)}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue/10 px-5 py-3 text-sm font-semibold text-blue transition-colors hover:bg-blue/15"
          >
            <Plane className="size-[18px]" />
            {tf("open")}
          </button>
        </div>

        {/* Form */}
        <form action={handleSubmit} ref={formRef} className="flex flex-col gap-4 scroll-mt-24">
          <div
            className={`rounded-2xl px-4 py-3 text-sm ring-1 transition-colors ${
              selected
                ? "bg-secondary/10 ring-secondary/30"
                : "bg-surface ring-ink/10"
            }`}
          >
            <span className="text-ink-soft/60">{t("selectedDay")}: </span>
            <span className="font-semibold text-ink">
              {selected
                ? selected.toLocaleDateString(locale, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : t("form.pickDayFirst")}
            </span>
          </div>

          <Field name="clientName" label={t("form.name")} required />
          <Field name="clientEmail" label={t("form.email")} type="email" required />
          <Field name="clientPhone" label={t("form.phone")} type="tel" />
          <div className="grid grid-cols-2 gap-4">
            <Field
              name="numPeople"
              label={t("form.people")}
              type="number"
              defaultValue="1"
              min={1}
            />
            <Field
              name="tourType"
              label={t("form.tourType")}
              placeholder={t("form.tourTypePlaceholder")}
            />
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

          <Button
            type="submit"
            size="lg"
            disabled={!selected || status === "submitting"}
            className="mt-1"
          >
            {status === "submitting" ? t("form.submitting") : t("form.submit")}
          </Button>

          {status === "success" && (
            <p className="rounded-xl bg-secondary/12 px-4 py-3 text-sm text-secondary">
              {t("form.success")}
            </p>
          )}
          {status === "error" && (
            <p className="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary-deep">
              {t("form.errorGeneric")}
            </p>
          )}
          {status === "errorDay" && (
            <p className="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary-deep">
              {t("form.errorDay")}
            </p>
          )}
        </form>
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
  placeholder,
  defaultValue,
  min,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  min?: number;
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
        placeholder={placeholder}
        defaultValue={defaultValue}
        min={min}
        className="rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-ink outline-none focus:border-primary"
      />
    </label>
  );
}

