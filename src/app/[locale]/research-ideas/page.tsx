import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/Container";
import { ResearchIdeasForm } from "@/components/ResearchIdeasForm";
import { Sparkles, BookOpen } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "researchIdeas" });
  return { title: t("title") };
}

export default async function ResearchIdeasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("researchIdeas");

  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--color-border)] py-16 md:py-24">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
        >
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
            <BookOpen className="h-3.5 w-3.5" />
            {t("ipmjBadge")}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <ResearchIdeasForm locale={locale} />
        </Container>
      </section>
    </>
  );
}
