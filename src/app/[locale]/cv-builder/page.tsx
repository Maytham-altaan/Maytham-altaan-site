import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/Container";
import { CvBuilderForm } from "@/components/CvBuilderForm";
import { Sparkles, Upload, Wand2, Download } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cvBuilder" });
  return { title: t("title") };
}

export default async function CvBuilderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cvBuilder");

  const steps = [
    { icon: Upload, titleKey: "step1Title", bodyKey: "step1Body" },
    { icon: Wand2, titleKey: "step2Title", bodyKey: "step2Body" },
    { icon: Download, titleKey: "step3Title", bodyKey: "step3Body" },
  ] as const;

  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--color-border)] py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -top-32 start-1/3 h-[24rem] w-[24rem] rounded-full bg-[var(--color-brand-200)]/40 blur-3xl" />
          <div className="absolute -bottom-24 end-1/4 h-[20rem] w-[20rem] rounded-full bg-[var(--color-accent-200)]/40 blur-3xl" />
        </div>
        <Container>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-accent-200)] bg-[var(--color-accent-100)] px-3 py-1 text-xs font-medium text-[var(--color-accent-700)]">
            <Sparkles className="h-3.5 w-3.5" />
            {t("eyebrow")}
          </div>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--color-muted)]">
            {t("subtitle")}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-100)] px-3 py-1.5 text-xs text-[var(--color-brand-800)]">
            {t("englishNote")}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="mb-12 grid gap-5 sm:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.titleKey}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold tracking-tight">
                    {t(step.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {t(step.bodyKey)}
                  </p>
                </div>
              );
            })}
          </div>

          <CvBuilderForm />
        </Container>
      </section>
    </>
  );
}
