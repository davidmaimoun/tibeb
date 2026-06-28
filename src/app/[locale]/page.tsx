import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { GuideIntro } from "@/components/sections/GuideIntro";
import { Places } from "@/components/sections/Places";
import { GalleryStrip } from "@/components/sections/GalleryStrip";
import { BookingSection } from "@/components/sections/BookingSection";
import { Contact } from "@/components/sections/Contact";
import { getAvailableDays } from "@/features/availability/actions";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const availableDays = await getAvailableDays();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <GuideIntro />
        <Places />
        <GalleryStrip />
        <BookingSection availableDays={availableDays} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
