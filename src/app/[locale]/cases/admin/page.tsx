import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { AdminDashboard } from "@/components/cases/AdminDashboard";
import {
  currentUserIsReviewer,
  getSupabaseServer,
} from "@/lib/supabase/server";
import { listPendingCases } from "@/lib/cases/queries";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cases" });
  return { title: t("adminTitle") };
}

export default async function CasesAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cases");

  const supa = await getSupabaseServer();
  const { data: userResp } = await supa.auth.getUser();
  if (!userResp.user) {
    redirect(`/${locale}/cases/auth`);
  }
  const isReviewer = await currentUserIsReviewer();
  if (!isReviewer) {
    return (
      <section className="py-16 md:py-24">
        <Container className="max-w-xl text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-[var(--color-muted)]" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            {t("adminForbiddenTitle")}
          </h1>
          <p className="mt-2 text-[var(--color-muted)]">
            {t("adminForbiddenBody", { email: userResp.user.email ?? "" })}
          </p>
        </Container>
      </section>
    );
  }

  const pending = await listPendingCases();
  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-200)] bg-[var(--color-brand-100)] px-3 py-1 text-xs font-medium text-[var(--color-brand-800)]">
          <ShieldCheck className="h-3.5 w-3.5" />
          {t("adminEyebrow")}
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
          {t("adminTitle")}
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          {t("adminSubtitle", { count: pending.length })}
        </p>
        <div className="mt-10">
          <AdminDashboard pending={pending} />
        </div>
      </Container>
    </section>
  );
}
