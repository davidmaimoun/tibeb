import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { getGalleryImages } from "@/features/content/gallery";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gallery");
  const images = getGalleryImages(locale);

  return (
    <>
      <Header />
      <main className="py-16 sm:py-20">
        <Container>
          <Link
            href="/"
            className="text-sm text-ink-soft/70 underline-offset-4 hover:underline"
          >
            ← {t("back")}
          </Link>
          <div className="mt-6 max-w-2xl">
            <p className="eyebrow mb-3">{t("eyebrow")}</p>
            <h1 className="display text-4xl text-ink sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-3 text-ink-soft/75">{t("subtitle")}</p>
          </div>

          {/* CSS columns = masonry. Any number of photos, any ratio. */}
          {images.length > 0 ? (
            <div className="mt-12 [column-gap:1rem] columns-2 md:columns-3 lg:columns-4">
              {images.map((image) => (
                <figure
                  key={image.id}
                  className="mb-4 break-inside-avoid overflow-hidden rounded-2xl ring-1 ring-ink/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.src}
                    alt=""
                    loading="lazy"
                    className="w-full transition-transform duration-500 hover:scale-[1.03]"
                  />
                </figure>
              ))}
            </div>
          ) : (
            <p className="mt-12 text-ink-soft/60">{t("subtitle")}</p>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}