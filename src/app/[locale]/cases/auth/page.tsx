import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/Container";
import { AuthForm } from "@/components/cases/AuthForm";
import { LogIn } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cases" });
  return { title: t("authTitle") };
}

export default async function CasesAuthPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cases");

  return (
    <section className="py-16 md:py-24">
      <Container className="max-w-md">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-200)] bg-[var(--color-brand-100)] px-3 py-1 text-xs font-medium text-[var(--color-brand-800)]">
          <LogIn className="h-3.5 w-3.5" />
          {t("authEyebrow")}
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          {t("authTitle")}
        </h1>
        <p className="mt-3 text-[var(--color-muted)]">{t("authSubtitle")}</p>
        <div className="mt-8">
          <AuthForm />
        </div>
      </Container>
    </section>
  );
}
