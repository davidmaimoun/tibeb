import { useTranslations } from "next-intl";
import { MapPin, Route, CalendarDays } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { places } from "@/features/content/places";

export function Places() {
  const t = useTranslations("places");

  return (
    <Section
      id="places"
      parallax
      className="bg-moka text-cream"
      bgImage="/images/hero.jpg"
    >
      {/* Pretty marker: this is the signature 14-day circuit */}
      <div className="mb-5 inline-flex items-center gap-2.5 rounded-full bg-accent/15 px-4 py-1.5 text-sm font-semibold text-accent-soft ring-1 ring-accent/30">
        <Route className="size-4" />
        {t("tripBadge")}
        <span className="text-accent-soft/40">·</span>
        <span className="text-cream/80">{t("tripDays")}</span>
      </div>

      <SectionHeader
        light
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {places.map((place, i) => (
          <Reveal key={place.key} delay={i * 70}>
            <article className="group relative h-full overflow-hidden rounded-[var(--radius-card)] bg-ink shadow-sm ring-1 ring-ink/10">
              <div
                className="aspect-[4/3] w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('${place.image}')` }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/70 to-transparent"
              />

              {/* Day tag — ties the stop to the itinerary */}
              <span className="absolute end-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink/55 px-2.5 py-1 text-xs font-semibold text-cream backdrop-blur-sm ring-1 ring-cream/15">
                <CalendarDays className="size-3.5 text-accent-soft" />
                {t("dayLabel")} {place.days}
              </span>

              <div className="absolute inset-x-0 bottom-0 p-5 text-cream">
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-accent-soft">
                  <MapPin className="size-3.5" />
                  {t(`items.${place.key}.region`)}
                </p>
                <h3 className="display mt-1 text-xl font-semibold">
                  {t(`items.${place.key}.name`)}
                </h3>
                <p className="mt-1.5 text-sm leading-snug text-cream/75">
                  {t(`items.${place.key}.description`)}
                </p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}