// Central i18n configuration. Add a locale here + a messages/<locale>.json file
// and it propagates everywhere (routing, switcher, <html dir/lang>).

export const locales = ["he", "en", "am", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

// Hebrew is right-to-left. Amharic (Geʽez script) is left-to-right.
export const rtlLocales: Locale[] = ["he"];

export function getDirection(locale: string): "rtl" | "ltr" {
  return rtlLocales.includes(locale as Locale) ? "rtl" : "ltr";
}

export const localeLabels: Record<Locale, string> = {
  he: "עברית",
  en: "English",
  am: "አማርኛ",
  fr: "Français",
};

// Métadonnées d'affichage pour le sélecteur de langue (drapeau + libellé natif).
export const localeMeta: Record<Locale, { label: string; flag: string }> = {
  he: { label: "עברית", flag: "🇮🇱" },
  en: { label: "English", flag: "🇬🇧" },
  am: { label: "አማርኛ", flag: "🇪🇹" },
  fr: { label: "Français", flag: "🇫🇷" },
};