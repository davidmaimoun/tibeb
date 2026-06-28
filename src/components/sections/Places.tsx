import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { places } from "@/features/content/places";

export function Places() {
  const t = useTranslations("places");

  return (
    <Section
      id="places"
      parallax
      bgImage="/images/hero.jpg"
    >
      <SectionHeader
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
