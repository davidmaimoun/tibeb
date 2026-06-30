import { useTranslations } from "next-intl";
import {
  CalendarDays,
  Route,
  Languages,
  Landmark,
  Mountain,
  Coffee,
  Camera,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { GuidePhoto } from "@/components/ui/GuidePhoto";
import { guideProfile } from "@/features/content/guide";
import { localeLabels } from "@/i18n/config";

const specialtyIcons: Record<string, LucideIcon> = {
  history: Landmark,
  trekking: Mountain,
  coffee: Coffee,
  photography: Camera,
};

export function GuideIntro() {
  const t = useTranslations("guide");

  const stats: { value: string; label: string; Icon: LucideIcon }[] = [
    {
      value: `${guideProfile.yearsExperience}+`,
      label: t("stats.experience"),
      Icon: CalendarDays,
    },
    {
      value: `${guideProfile.toursCompleted}+`,
      label: t("stats.tours"),
      Icon: Route,
    },
    {
      value: `${guideProfile.languagesSpoken.length}`,
      label: t("stats.languages"),
      Icon: Languages,
    },
  ];

  return (
    <Section
      id="guide"
      className="bg-surface"
      bgImage=""
    >
      <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal className="relative mx-auto w-full max-w-sm">
          <GuidePhoto
            src={guideProfile.photo}
            alt={guideProfile.name ?? "Guide"}
            shape="pebble"
            className="w-full drop-shadow-xl"
          />
          <span
            aria-hidden
            className="geez-mark absolute -bottom-6 end-[12%] text-7xl opacity-20"
          >
            መሪ
          </span>
        </Reveal>

        <Reveal delay={120}>
          <p className="eyebrow mb-3">{t("eyebrow")}</p>
          <h2 className="display text-3xl text-ink sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft/85">
            {t("bio")}
          </p>

          {/* Stat cards */}
          <dl className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="group rounded-2xl bg-cream p-4 text-center ring-1 ring-ink/10 transition-shadow hover:shadow-md sm:p-5 sm:text-start"
              >
                <s.Icon className="mx-auto mb-2 size-5 text-secondary sm:mx-0" />
                <dt className="display text-2xl font-bold text-primary sm:text-3xl">
                  {s.value}
                </dt>
                <dd className="mt-1 text-xs text-ink-soft/70 sm:text-sm">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>

          {/* Specialty cards */}
          <ul className="mt-6 grid grid-cols-2 gap-3">
            {guideProfile.specialties.map((key) => {
              const Icon = specialtyIcons[key] ?? Landmark;
              return (
                <li
                  key={key}
                  className="flex items-center gap-3 rounded-xl bg-secondary/8 px-4 py-3 ring-1 ring-secondary/15"
                >
                  <Icon className="size-5 shrink-0 text-secondary" />
                  <span className="text-sm font-medium text-ink">
                    {t(`specialties.${key}`)}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 text-sm text-ink-soft/60">
            {guideProfile.languagesSpoken
              .map((l) => localeLabels[l])
              .join(" · ")}
          </p>
        </Reveal>
      </div>
    </Section>
  );
}