import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/Container";
import { ContactForm } from "@/components/ContactForm";
import { SocialLinks } from "@/components/SocialLinks";
import { siteConfig } from "@/lib/site-config";
import { MapPin, Clock, Mail, Phone, MessageCircle } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <>
      <section className="border-b border-[var(--color-border)] py-16 md:py-24">
        <Container>
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-brand-700)]">
            {t("eyebrow")}
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--color-muted)]">
            {t("subtitle")}
          </p>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="md:col-span-2">
              <ContactForm />
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-subtle)]/50 p-6">
                <h3 className="text-lg font-semibold tracking-tight">
                  {t("directHeading")}
                </h3>

                <ul className="mt-5 space-y-5 text-sm text-[var(--color-foreground)]/85">
                  <li>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                      <Mail className="h-3.5 w-3.5" />
                      {t("emailLabelShort")}
                    </div>
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="mt-1.5 block break-all font-medium text-[var(--color-brand-700)] hover:text-[var(--color-brand-800)]"
                    >
                      {siteConfig.email}
                    </a>
                  </li>

                  <li>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                      <Phone className="h-3.5 w-3.5" />
                      {t("phoneLabel")}
                    </div>
                    <ul className="mt-2 space-y-3">
                      {siteConfig.phones.map((p) => (
                        <li
                          key={p.intl}
                          className="flex flex-wrap items-center gap-x-3 gap-y-1"
                        >
                          <span
                            dir="ltr"
                            className="font-medium tabular-nums text-[var(--color-foreground)]"
                          >
                            {p.display}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs">
                            <a
                              href={`tel:${p.intl}`}
                              className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[var(--color-foreground)]/80 transition hover:border-[var(--color-brand-600)] hover:text-[var(--color-brand-700)]"
                            >
                              {t("callLabel")}
                            </a>
                            <a
                              href={`https://wa.me/${p.wa}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[var(--color-foreground)]/80 transition hover:border-[var(--color-brand-600)] hover:text-[var(--color-brand-700)]"
                            >
                              <MessageCircle className="h-3 w-3" />
                              {t("whatsappLabel")}
                            </a>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>

                  <li>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                      <MapPin className="h-3.5 w-3.5" />
                      {t("directLocation")}
                    </div>
                  </li>

                  <li>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                      <Clock className="h-3.5 w-3.5" />
                      {t("directHours")}
                    </div>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                  {t("socialLabel")}
                </div>
                <div className="mt-4">
                  <SocialLinks />
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
