import { useTranslations, useLocale } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { getGalleryImages } from "@/features/content/gallery";
import { GalleryScroller } from "@/components/sections/GalleryScroller";

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

      {/* Horizontal strip with arrows (first ~10 shown; all on /gallery). */}
      {images.length > 0 && <GalleryScroller images={images.slice(0, 10)} />}
    </section>
  );
}