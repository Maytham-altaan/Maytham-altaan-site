import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Link } from "@/i18n/navigation";
import { CommentsSection } from "@/components/cases/CommentsSection";
import {
  getApprovedCaseBySlug,
  listCommentsForCase,
} from "@/lib/cases/queries";
import { ArrowLeft, Calendar, User2 } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const c = await getApprovedCaseBySlug(slug);
  return { title: c?.title_en ?? "Case" };
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cases");
  const c = await getApprovedCaseBySlug(slug);
  if (!c) notFound();
  const comments = await listCommentsForCase(c.id);

  return (
    <section className="py-12 md:py-16">
      <Container>
        <Link
          href="/cases"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-brand-700)] hover:text-[var(--color-brand-800)]"
        >
          <ArrowLeft className="h-3.5 w-3.5 flip-rtl" />
          {t("backToLibrary")}
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
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
          {c.drug && (
            <span className="rounded-full bg-[var(--color-subtle)] px-2 py-0.5 text-[var(--color-foreground)]/70">
              {c.drug}
            </span>
          )}
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
          {c.title_en}
        </h1>
        {c.title_ar && (
          <h2 dir="rtl" className="mt-2 text-xl font-semibold text-[var(--color-foreground)]/85">
            {c.title_ar}
          </h2>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--color-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <User2 className="h-3.5 w-3.5" />
            {c.display_author || (c.show_author ? c.submitter_name : t("anonymousAuthor"))}
          </span>
          <span className="inline-flex items-center gap-1.5" dir="ltr">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(c.submitted_at).toLocaleDateString(locale)}
          </span>
          {c.patient_age !== null && (
            <span>{t("patientDemo", { age: c.patient_age, sex: c.patient_sex || "—" })}</span>
          )}
        </div>

        <p className="mt-6 max-w-3xl text-lg text-[var(--color-foreground)]/85">
          {c.summary_en}
        </p>
        {c.summary_ar && (
          <p dir="rtl" className="mt-3 max-w-3xl text-base text-[var(--color-foreground)]/80">
            {c.summary_ar}
          </p>
        )}

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <article className="prose-like md:col-span-2 space-y-8">
            <Section title={t("presentationLabel")} body={c.presentation} />
            {c.investigations && <Section title={t("investigationsLabel")} body={c.investigations} />}
            {c.diagnosis && <Section title={t("diagnosisLabel")} body={c.diagnosis} />}
            {c.treatment && <Section title={t("treatmentLabel")} body={c.treatment} />}
            {c.case_outcome && <Section title={t("caseOutcomeLabel")} body={c.case_outcome} />}
            {c.learning_points && <Section title={t("learningPointsLabel")} body={c.learning_points} />}
            {c.references_text && <Section title={t("referencesLabel")} body={c.references_text} />}
          </article>

          <aside className="md:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-[var(--color-border)] bg-[var(--color-subtle)]/40 p-5 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                {t("howToCite")}
              </div>
              <p className="mt-2 break-words text-xs text-[var(--color-foreground)]/85">
                {c.display_author || (c.show_author ? c.submitter_name : t("anonymousAuthor"))}.{" "}
                "{c.title_en}". Clinical Case Library, Maytham Altaan.{" "}
                <span dir="ltr">{new Date(c.submitted_at).getFullYear()}</span>. maytham-altaan.com/cases/{c.slug}
              </p>
            </div>
          </aside>
        </div>

        <CommentsSection caseId={c.id} initialComments={comments} />

        <p className="mt-12 text-xs italic text-[var(--color-muted)]">
          {t("ethicsDisclaimer")}
        </p>
      </Container>
    </section>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-700)]">
        {title}
      </h3>
      <p className="mt-2 whitespace-pre-wrap text-base text-[var(--color-foreground)]/90">
        {body}
      </p>
    </div>
  );
}
