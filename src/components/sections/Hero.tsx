import { useTranslations, useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ParallaxBg } from "@/components/ui/ParallaxBg";
import { ButtonLink } from "@/components/ui/Button";
import { getGalleryImages } from "@/features/content/gallery";
import { places } from "@/features/content/places";

// Faded landscape behind everything (reappears in "Where we can go").
const HERO_BG = "/images/hero.jpg";
const FALLBACK = "/images/hero-portrait.jpg";

export function Hero() {
  const t = useTranslations("hero");
  const tp = useTranslations("places.items");
  const locale = useLocale();

  // Use the guide's real photos for the montage (locale-aware: he_* excluded
  // outside Hebrew). Falls back gracefully before photos are uploaded.
  const photos = getGalleryImages(locale);
  const main = photos[0]?.src ?? FALLBACK;
  const accent = photos[1]?.src ?? photos[0]?.src ?? HERO_BG;
  const third = photos[2]?.src ?? accent;

  const destinations = places.map((p) => tp(`${p.key}.name`)).join(" · ");

  return (
    <section
      className="relative overflow-hidden text-cream"
      style={{
        // Deep highland green — Ethiopia. Dark enough for light text.
        backgroundColor: "color-mix(in srgb, var(--c-green-deep) 52%, var(--c-ink))",
      }}
    >
      {/* Parallax photo + flag wash (green / yellow / red) + vignette. */}
      <ParallaxBg src={HERO_BG} opacity={0.18} strength={80} />
      <div
        aria-hidden
        className="anim-fade-in pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(85% 82% at 6% 2%, color-mix(in srgb, var(--c-green) 30%, transparent), transparent 58%), radial-gradient(80% 78% at 94% 2%, color-mix(in srgb, var(--c-yellow) 22%, transparent), transparent 54%), radial-gradient(80% 85% at 100% 100%, color-mix(in srgb, var(--c-red) 18%, transparent), transparent 60%), radial-gradient(70% 80% at 0% 100%, color-mix(in srgb, var(--c-green) 22%, transparent), transparent 62%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 25%, transparent 54%, rgba(0,0,0,0.5))",
        }}
      />

      {/* Geʽez signature mark. */}
      <span
        aria-hidden
        className="geez-mark anim-mark pointer-events-none absolute -top-10 end-[-2%] select-none text-[34vw] leading-none sm:text-[26vw] lg:text-[20vw]"
      >
        ጥበብ
      </span>

      <Container className="relative grid items-center gap-12 py-24 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:py-32">
        {/* Copy */}
        <div>
          <p
            className="eyebrow anim-fade-up text-accent"
            style={{ animationDelay: "0.05s" }}
          >
            {t("kicker")}
          </p>
          <h1
            className="display anim-fade-up mt-4 text-4xl leading-[1.04] sm:text-5xl md:text-6xl"
            style={{ animationDelay: "0.15s" }}
          >
            {t.rich("title", {
              eth: (chunks) => (
                <span className="font-accent flag-text italic">{chunks}</span>
              ),
            })}
          </h1>
          <p
            className="anim-fade-up mt-6 max-w-xl text-lg leading-relaxed text-cream/85"
            style={{ animationDelay: "0.28s" }}
          >
            {t("subtitle")}
          </p>
          <div
            className="anim-fade-up mt-9 flex flex-wrap gap-3"
            style={{ animationDelay: "0.4s" }}
          >
            <ButtonLink href="#calendar" variant="gold" size="lg">
              {t("cta")}
            </ButtonLink>
            <ButtonLink href="#guide" variant="green" size="lg">
              {t("ctaSecondary")}
            </ButtonLink>
          </div>

          {/* Destinations teaser */}
          <p
            className="anim-fade-up mt-8 text-xs uppercase tracking-[0.2em] text-accent-soft/80"
            style={{ animationDelay: "0.5s" }}
          >
            {destinations}
          </p>
        </div>

        {/* Photo montage — the guide's real photos, floating with depth. */}
        <div
          className="anim-fade-up relative mx-auto aspect-[4/5] w-full max-w-md"
          style={{ animationDelay: "0.35s" }}
        >
          {/* main */}
          <div
            className="float-y absolute left-0 top-[4%] w-[72%]"
            style={{ animationDelay: "0s" }}
          >
            <div className="rotate-[-3deg] overflow-hidden rounded-[1.75rem] ring-1 ring-cream/20 shadow-2xl">
              <div
                className="ken aspect-[3/4] w-full bg-cover bg-center"
                style={{ backgroundImage: `url('${main}')` }}
              />
            </div>
          </div>

          {/* accent top-right */}
          <div
            className="float-y absolute end-0 top-[20%] w-[46%]"
            style={{ animationDelay: "1.4s" }}
          >
            <div className="rotate-[4deg] overflow-hidden rounded-2xl ring-1 ring-cream/20 shadow-2xl">
              <div
                className="aspect-square w-full bg-cover bg-center"
                style={{ backgroundImage: `url('${accent}')` }}
              />
            </div>
          </div>

          {/* accent bottom */}
          <div
            className="float-y absolute bottom-[2%] end-[14%] w-[44%]"
            style={{ animationDelay: "2.6s" }}
          >
            <div className="rotate-[-1.5deg] overflow-hidden rounded-2xl ring-1 ring-cream/20 shadow-2xl">
              <div
                className="aspect-[4/3] w-full bg-cover bg-center"
                style={{ backgroundImage: `url('${third}')` }}
              />
            </div>
          </div>

          {/* gold badge */}
          <div className="absolute bottom-[8%] start-[2%] rounded-xl bg-accent px-4 py-2 text-ink shadow-lg">
            <span className="display text-sm font-bold">Ethiopia · ኢትዮጵያ</span>
          </div>
        </div>
      </Container>

      {/* Scroll cue */}
      <a
        href="#guide"
        aria-label={t("ctaSecondary")}
        className="absolute inset-x-0 bottom-5 mx-auto flex w-fit flex-col items-center text-cream/70"
      >
        <ChevronDown className="scroll-cue size-6" />
      </a>
    </section>
  );
}