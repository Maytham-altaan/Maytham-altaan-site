import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/Container";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ChevronRight, BookOpen } from "lucide-react";
import { POLICY_DOCS, JOURNAL, type Bi } from "@/content/case-policies";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const L = (b: Bi) => (locale === "ar" ? b.ar : b.en);
  return {
    title: `${L(JOURNAL.name)} — ${locale === "ar" ? "السياسات التحريرية" : "Editorial Policies"}`,
    description:
      locale === "ar"
        ? "السياسات التحريرية وأخلاقيات النشر والوصول المفتوح لمكتبة الحالات السريرية."
        : "Editorial policies, publication ethics, and open-access terms of the Clinical Case Library.",
  };
}

export default async function PoliciesHub({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ar = locale === "ar";
  const L = (b: Bi) => (ar ? b.ar : b.en);

  const masthead: { label: string; value: string }[] = [
    { label: ar ? "الناشر" : "Publisher", value: L(JOURNAL.publisher) },
    { label: ar ? "رئيس التحرير" : "Editor-in-Chief", value: L(JOURNAL.editorInChief) },
    { label: "ISSN", value: JOURNAL.issn || (ar ? "قيد الإصدار" : "Pending assignment") },
    { label: ar ? "الترخيص" : "License", value: JOURNAL.license },
    { label: ar ? "الرسوم" : "Fees", value: ar ? "لا توجد رسوم" : "No fees (free)" },
    { label: ar ? "التواصل" : "Contact", value: JOURNAL.contactEmail },
  ];

  return (
    <section className="py-12 md:py-16" dir={ar ? "rtl" : "ltr"}>
      <Container>
        <Link
          href="/cases"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-brand-700)] hover:text-[var(--color-brand-800)]"
        >
          <ArrowLeft className="h-3.5 w-3.5 flip-rtl" />
          {ar ? "العودة للمكتبة" : "Back to the library"}
        </Link>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-200)] bg-[var(--color-brand-100)] px-3 py-1 text-xs font-medium text-[var(--color-brand-800)]">
          <BookOpen className="h-3.5 w-3.5" />
          {ar ? "السياسات التحريرية" : "Editorial Policies"}
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
          {L(JOURNAL.name)}
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
          {ar
            ? "مجموعة مفتوحة الوصول ومُحكَّمة من تقارير الحالات السريرية. تجد أدناه سياساتنا التحريرية وأخلاقيات النشر."
            : "An open-access, peer-reviewed collection of clinical case reports. Our editorial and publishing policies are below."}
        </p>

        {/* Masthead */}
        <dl className="mt-8 grid gap-x-8 gap-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-subtle)]/40 p-6 sm:grid-cols-2">
          {masthead.map((m) => (
            <div key={m.label} className="flex items-baseline justify-between gap-3 border-b border-[var(--color-border)]/60 pb-2">
              <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                {m.label}
              </dt>
              <dd className="text-sm font-medium text-[var(--color-foreground)] text-end break-words">
                {m.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* Policy docs */}
        <div className="mt-8 grid gap-3">
          {POLICY_DOCS.map((d) => (
            <Link
              key={d.slug}
              href={`/cases/policies/${d.slug}`}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5 transition hover:border-[var(--color-brand-300)] hover:bg-[var(--color-subtle)]/40"
            >
              <div>
                <h2 className="font-semibold text-[var(--color-foreground)]">{L(d.title)}</h2>
                <p className="mt-0.5 text-sm text-[var(--color-muted)]">{L(d.summary)}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-[var(--color-muted)] flip-rtl transition group-hover:text-[var(--color-brand-700)]" />
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
