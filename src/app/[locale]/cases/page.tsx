import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/Container";
import { Link } from "@/i18n/navigation";
import { CaseFilters } from "@/components/cases/CaseFilters";
import { listApprovedCases } from "@/lib/cases/queries";
import type { CaseType, CaseOutcome } from "@/lib/cases/types";
import { Stethoscope, FilePlus, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cases" });
  return { title: t("libraryTitle") };
}

export default async function CasesIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const t = await getTranslations("cases");
  const cases = await listApprovedCases({
    specialty: get("specialty"),
    caseType: get("caseType") as CaseType | undefined,
    outcome: get("outcome") as CaseOutcome | undefined,
    drug: get("drug"),
  });

  return (
    <>
      <section className="border-b border-[var(--color-border)] py-16 md:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-200)] bg-[var(--color-brand-100)] px-3 py-1 text-xs font-medium text-[var(--color-brand-800)]">
                <Stethoscope className="h-3.5 w-3.5" />
                {t("eyebrow")}
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                {t("libraryTitle")}
              </h1>
              <p className="mt-4 text-lg text-[var(--color-muted)]">
                {t("librarySubtitle")}
              </p>
            </div>
            <Link
              href="/cases/submit"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-700)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-brand-800)]"
            >
              <FilePlus className="h-4 w-4" />
              {t("submitCta")}
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-12">
        <Container>
          <CaseFilters />

          {cases.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-subtle)]/40 p-12 text-center text-[var(--color-muted)]">
              {t("emptyState")}
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {cases.map((c) => (
                <Link
                  key={c.id}
                  href={`/cases/${c.slug}`}
                  className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 transition hover:-translate-y-0.5 hover:border-[var(--color-brand-600)] hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider">
                    <span className="rounded-full bg-[var(--color-brand-100)] px-2 py-0.5 text-[var(--color-brand-800)]">
                      {c.specialty}
                    </span>
                    <span className="rounded-full bg-[var(--color-accent-100)] px-2 py-0.5 text-[var(--color-accent-700)]">
                      {t(`caseType.${c.case_type}`)}
                    </span>
                    {c.outcome && (
                      <span className="rounded-full bg-[var(--color-subtle)] px-2 py-0.5 text-[var(--color-foreground)]/70">
                        {t(`outcome.${c.outcome}`)}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight">
                    {c.title_en}
                  </h3>
                  {c.title_ar && (
                    <h4 dir="rtl" className="mt-0.5 text-sm text-[var(--color-foreground)]/80">
                      {c.title_ar}
                    </h4>
                  )}
                  <p className="mt-3 flex-1 text-sm text-[var(--color-muted)] line-clamp-4">
                    {c.summary_en}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-[var(--color-muted)]">
                      {c.display_author || (c.show_author ? c.submitter_name : t("anonymousAuthor"))}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[var(--color-brand-700)]">
                      {t("readCase")} <ArrowRight className="h-3 w-3 flip-rtl" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <p className="mt-10 text-xs italic text-[var(--color-muted)]">
            {t("ethicsDisclaimer")}
          </p>
        </Container>
      </section>
    </>
  );
}
