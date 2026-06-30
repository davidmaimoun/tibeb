import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { contactChannels } from "@/lib/utils";

export function Contact() {
  const t = useTranslations("contact");
  const { whatsappUrl, mailto, phone, email } = contactChannels();

  return (
    <section
      id="contact"
      className="bg-moka relative scroll-mt-24 overflow-hidden py-20 text-cream sm:py-28"
    >
      {/* Faded photo backdrop — swap for one of the guide's images. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.08]"
        style={{
          backgroundImage: "url('/images/places/danakil.jpg')",
        }}
      />

      <Container className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="max-w-xl">
          <p className="eyebrow text-accent">{t("eyebrow")}</p>
          <h2 className="display mt-3 text-3xl text-cream sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-cream/80">{t("subtitle")}</p>
          <p className="mt-3 text-sm text-cream/55">{t("responseTime")}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          {whatsappUrl ? (
            <ButtonLink
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="green"
              size="lg"
            >
              <WhatsAppIcon />
              {t("whatsapp")}
            </ButtonLink>
          ) : null}
          {mailto ? (
            <ButtonLink href={mailto} variant="primary" size="lg">
              <Mail className="size-5" />
              {t("email")}
            </ButtonLink>
          ) : null}
          {(phone || email) && (
            <p className="text-center text-sm text-cream/50">
              {phone} {phone && email ? "·" : ""} {email}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}

// lucide has no WhatsApp brand glyph, so keep a small inline one.
function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M.06 24l1.69-6.16a11.87 11.87 0 01-1.6-5.95C.16 5.34 5.5 0 12.06 0a11.82 11.82 0 018.41 3.49 11.82 11.82 0 013.49 8.41c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 01-5.7-1.45L.06 24zm6.6-3.8c1.68.99 3.28 1.59 5.4 1.59 5.45 0 9.9-4.43 9.9-9.89a9.86 9.86 0 00-9.89-9.9C6.6 1.99 2.16 6.43 2.16 11.9c0 2.22.65 3.88 1.74 5.62l-.99 3.62 3.75-.94zm11.39-5.46c-.07-.12-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42z" />
    </svg>
  );
}