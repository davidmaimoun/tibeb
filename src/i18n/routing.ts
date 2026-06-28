import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale } from "./config";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Always prefix so every locale has a clean, shareable URL (/en, /he, ...).
  localePrefix: "always",
  // Always land on the default locale (English). Set to true to instead pick
  // the visitor's browser language automatically.
  localeDetection: false,
});