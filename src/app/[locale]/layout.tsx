import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Bricolage_Grotesque,
  Hanken_Grotesk,
  Noto_Serif_Ethiopic,
  Heebo,
  Fraunces,
} from "next/font/google";
import { routing } from "@/i18n/routing";
import { getDirection } from "@/i18n/config";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});
const ethiopic = Noto_Serif_Ethiopic({
  subsets: ["ethiopic"],
  variable: "--font-ethiopic-serif",
  display: "swap",
  weight: ["400", "600", "700"],
});
const heebo = Heebo({
  subsets: ["hebrew"],
  variable: "--font-hebrew",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tibeb.example";
const OG_LOCALE: Record<string, string> = {
  en: "en_US",
  fr: "fr_FR",
  he: "he_IL",
  am: "am_ET",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `/${l}`]),
  );

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    applicationName: "Tibeb",
    alternates: {
      canonical: `/${locale}`,
      languages: { ...languages, "x-default": "/en" },
    },
    openGraph: {
      type: "website",
      siteName: "Tibeb",
      title: t("title"),
      description: t("description"),
      url: `/${locale}`,
      locale: OG_LOCALE[locale] ?? "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const dir = getDirection(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${bricolage.variable} ${hanken.variable} ${ethiopic.variable} ${heebo.variable} ${fraunces.variable}`}
    >
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}