import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { contactChannels } from "@/lib/utils";

export function Footer() {
  const t = useTranslations();
  const { whatsappUrl, mailto } = contactChannels();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink/10 bg-ink text-cream">
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <div className="flex items-baseline gap-2">
            <span className="display text-2xl font-bold">Tibeb</span>
            <span className="geez-mark text-xl" aria-hidden>
              ጥበብ
            </span>
          </div>
          <p className="mt-3 text-sm text-cream/70">{t("footer.tagline")}</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cream/80 underline-offset-4 hover:underline"
              >
                {t("contact.whatsapp")}
              </a>
            ) : null}
            {mailto ? (
              <a
                href={mailto}
                className="text-sm text-cream/80 underline-offset-4 hover:underline"
              >
                {t("contact.email")}
              </a>
            ) : null}
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-cream/50">
              {t("footer.language")}
            </p>
            <LanguageSwitcher className="[&_button]:text-cream/70" />
          </div>
        </div>
      </Container>
      <Container className="border-t border-cream/10 py-5">
        <p className="text-xs text-cream/50">
          © {year} Tibeb. {t("footer.rights")}
        </p>
      </Container>
    </footer>
  );
}
