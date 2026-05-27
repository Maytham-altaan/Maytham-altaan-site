import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/Container";
import {
  ScanSearch,
  Wand2,
  Globe2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Detector from "@/components/altaan-detector/Detector.jsx";

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
      <section className="relative overflow-hidden border-b border-[var(--color-border)] pt-12 pb-8 md:pt-16 md:pb-10">
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
          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight md:text-4xl md:leading-[1.15]">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[var(--color-muted)] md:text-lg">
            {t("subtitle")}
          </p>
        </Container>
      </section>

      {/* Native detector — runs in the browser, calls /api/detector/* which
          Next.js rewrites to https://detector.maytham-altaan.com/api/* */}
      <section className="bg-white py-8 md:py-12">
        <Detector />
      </section>

      <section className="border-t border-[var(--color-border)] py-16 md:py-20">
        <Container>
          <p className="max-w-3xl text-pretty text-[var(--color-foreground)]/85 md:text-lg">
            {t("intro")}
          </p>

          <h2 className="mt-12 text-2xl font-semibold tracking-tight md:text-3xl">
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
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
