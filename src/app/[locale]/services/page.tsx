import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/Container";
import { Link } from "@/i18n/navigation";
import {
  Stethoscope,
  BarChart3,
  Microscope,
  Code2,
  ArrowRight,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return { title: t("title") };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");

  const services = [
    { icon: Stethoscope, titleKey: "service1Title", descKey: "service1Desc" },
    { icon: BarChart3, titleKey: "service2Title", descKey: "service2Desc" },
    { icon: Microscope, titleKey: "service3Title", descKey: "service3Desc" },
    { icon: Code2, titleKey: "service4Title", descKey: "service4Desc" },
  ] as const;

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
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.titleKey}
                  className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-7"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold tracking-tight">
                    {t(s.titleKey)}
                  </h2>
                  <p className="mt-3 text-[var(--color-muted)]">
                    {t(s.descKey)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-16 rounded-3xl bg-[var(--color-brand-800)] p-8 text-white md:p-12">
            <div className="grid items-center gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
                <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  {t("engagementTitle")}
                </h3>
                <p className="mt-4 text-[var(--color-brand-100)] md:text-lg">
                  {t("engagementBody")}
                </p>
              </div>
              <div className="md:justify-self-end">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-500)] px-5 py-3 text-sm font-semibold text-[#451a03] transition hover:bg-[var(--color-accent-400)]"
                >
                  {t("cta")}
                  <ArrowRight className="h-4 w-4 flip-rtl" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
