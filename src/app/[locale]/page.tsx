import { setRequestLocale, getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { GuideIntro } from "@/components/sections/GuideIntro";
import { Places } from "@/components/sections/Places";
import { GalleryStrip } from "@/components/sections/GalleryStrip";
import { BookingSection } from "@/components/sections/BookingSection";
import { Contact } from "@/components/sections/Contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tibeb.example";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "meta" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Tibeb",
    description: t("description"),
    url: `${SITE_URL}/${locale}`,
    image: `${SITE_URL}/opengraph-image`,
    areaServed: { "@type": "Country", name: "Ethiopia" },
    knowsLanguage: ["am", "en", "fr", "he"],
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "TouristTrip",
        name: "14-Day Grand Ethiopia Circuit",
        touristType: "Cultural & adventure travellers",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        <Hero />
        <GuideIntro />
        <Places />
        <GalleryStrip />
        <BookingSection />
        <Contact />
      </main>
      <Footer />
    </>
  );
}