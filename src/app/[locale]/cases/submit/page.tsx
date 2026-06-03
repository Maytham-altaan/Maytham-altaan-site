import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/Container";
import { SubmitCaseForm } from "@/components/cases/SubmitCaseForm";
import { FilePlus } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cases" });
  return { title: t("submitTitle") };
}

export default async function SubmitCasePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cases");

  return (
    <>
      <section className="border-b border-[var(--color-border)] py-12 md:py-16">
        <Container>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-200)] bg-[var(--color-brand-100)] px-3 py-1 text-xs font-medium text-[var(--color-brand-800)]">
            <FilePlus className="h-3.5 w-3.5" />
            {t("submitEyebrow")}
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            {t("submitTitle")}
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--color-muted)]">
            {t("submitSubtitle")}
          </p>
        </Container>
      </section>
      <section className="py-10 md:py-14">
        <Container>
          <SubmitCaseForm />
        </Container>
      </section>
    </>
  );
}
