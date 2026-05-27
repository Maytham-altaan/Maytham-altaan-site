import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/Container";
import {
  ScanSearch,
  Wand2,
  Globe2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aiDetector" });
  return { title: t("title") };
}

export default async function AiDetectorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("aiDetector");

  const features = [
    { icon: ScanSearch, titleKey: "feature1Title", descKey: "feature1Desc" },
    { icon: Wand2, titleKey: "feature2Title", descKey: "feature2Desc" },
    { icon: Globe2, titleKey: "feature3Title", descKey: "feature3Desc" },
    { icon: ShieldCheck, titleKey: "feature4Title", descKey: "feature4Desc" },
  ] as const;

  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--color-border)] py-16 md:py-24">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
        >
          <div className="absolute -top-20 end-1/4 h-[26rem] w-[26rem] rounded-full bg-[var(--color-accent-200)]/40 blur-3xl" />
        </div>
        <Container>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-accent-200)] bg-[var(--color-accent-100)] px-3 py-1 text-xs font-medium text-[var(--color-accent-700)]">
              <Sparkles className="h-3.5 w-3.5" />
              {t("eyebrow")}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-100)] px-3 py-1 text-xs font-medium text-[var(--color-brand-800)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-brand-500)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-brand-600)]" />
              </span>
              {t("liveBadge")}
            </div>
          </div>
          <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold tracking-tight md:text-5xl md:leading-[1.1]">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-[var(--color-muted)]">
            {t("subtitle")}
          </p>
          <p className="mt-6 max-w-3xl text-pretty text-[var(--color-foreground)]/85 md:text-lg">
            {t("intro")}
          </p>
          <a
            href={siteConfig.products.aiDetector}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-500)] px-6 py-3 text-sm font-semibold text-[#451a03] shadow-sm transition hover:bg-[var(--color-accent-400)]"
          >
            {t("tryCta")}
            <ExternalLink className="h-4 w-4" />
          </a>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {t("featuresTitle")}
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.titleKey}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-7"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent-100)] text-[var(--color-accent-700)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">
                    {t(f.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {t(f.descKey)}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-subtle)]/40 py-16 md:py-20">
        <Container>
          <div className="grid gap-12 md:grid-cols-2 md:items-start">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {t("pricingTitle")}
              </h2>
              <p className="mt-5 text-[var(--color-muted)] md:text-lg">
                {t("pricingBody")}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-brand-700)] to-[var(--color-brand-900)] p-8 text-white md:p-10">
              <h3 className="text-2xl font-semibold tracking-tight">
                {t("liveTitle")}
              </h3>
              <p className="mt-3 text-[var(--color-brand-100)]">
                {t("liveBody")}
              </p>
              <a
                href={siteConfig.products.aiDetector}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-500)] px-5 py-3 text-sm font-semibold text-[#451a03] transition hover:bg-[var(--color-accent-400)]"
              >
                {t("tryCta")}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
