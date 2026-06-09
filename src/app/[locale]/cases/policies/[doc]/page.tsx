import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import {
  POLICY_DOCS,
  getPolicyDoc,
  JOURNAL,
  type Bi,
} from "@/content/case-policies";

export const dynamic = "force-static";

export function generateStaticParams() {
  return POLICY_DOCS.map((d) => ({ doc: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; doc: string }>;
}) {
  const { locale, doc } = await params;
  const d = getPolicyDoc(doc);
  if (!d) return { title: "Policy" };
  const L = (b: Bi) => (locale === "ar" ? b.ar : b.en);
  return { title: L(d.title), description: L(d.summary) };
}

export default async function PolicyDocPage({
  params,
}: {
  params: Promise<{ locale: string; doc: string }>;
}) {
  const { locale, doc } = await params;
  setRequestLocale(locale);
  const d = getPolicyDoc(doc);
  if (!d) notFound();
  const ar = locale === "ar";
  const L = (b: Bi) => (ar ? b.ar : b.en);

  return (
    <section className="py-12 md:py-16" dir={ar ? "rtl" : "ltr"}>
      <Container className="max-w-3xl">
        <Link
          href="/cases/policies"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-brand-700)] hover:text-[var(--color-brand-800)]"
        >
          <ArrowLeft className="h-3.5 w-3.5 flip-rtl" />
          {ar ? "كل السياسات" : "All policies"}
        </Link>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-700)]">
          {L(JOURNAL.name)}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          {L(d.title)}
        </h1>
        <p className="mt-2 text-lg text-[var(--color-muted)]">{L(d.summary)}</p>

        <div className="mt-8 space-y-8">
          {d.sections.map((s, i) => (
            <div key={i}>
              <h2 className="text-lg font-semibold tracking-tight">{L(s.h)}</h2>
              <p className="mt-2 leading-relaxed text-[var(--color-foreground)]/90">
                {L(s.p)}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-12 border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-muted)]">
          {ar
            ? "للاستفسارات التحريرية: "
            : "Editorial enquiries: "}
          <a className="underline" href={`mailto:${JOURNAL.contactEmail}`}>
            {JOURNAL.contactEmail}
          </a>
        </p>
      </Container>
    </section>
  );
}
