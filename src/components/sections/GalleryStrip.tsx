import { useTranslations, useLocale } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { getGalleryImages } from "@/features/content/gallery";

export function GalleryStrip() {
  const t = useTranslations("gallery");
  const locale = useLocale();
  const images = getGalleryImages(locale);

  return (
    <section id="gallery" className="scroll-mt-24 bg-surface py-20 sm:py-28">
      <Container className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow mb-3">{t("eyebrow")}</p>
          <h2 className="display text-3xl sm:text-4xl md:text-5xl text-ink">
            {t("title")}
          </h2>
          <p className="mt-3 text-ink-soft/75">{t("subtitle")}</p>
        </div>
        {images.length > 0 && (
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-ink-soft"
          >
            {t("viewAll")} <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        )}
      </Container>

      {/* Horizontal snap-scroll strip (first ~10 shown here; all on /gallery). */}
      {images.length > 0 && (
        <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:px-8">
          {images.slice(0, 10).map((image) => (
            <Link
              key={image.id}
              href="/gallery"
              className="relative aspect-3/4 w-64 flex-none snap-start overflow-hidden rounded-2xl ring-1 ring-ink/10 sm:w-72"
            >
              <div
                className="h-full w-full bg-cover bg-center transition-transform duration-500 hover:scale-105"
                style={{ backgroundImage: `url('${image.src}')` }}
              />
            </Link>
          ))}
          <div className="w-1 flex-none" aria-hidden />
        </div>
      )}
    </section>
  );
}