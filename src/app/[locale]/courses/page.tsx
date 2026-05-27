import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/Container";
import { Link } from "@/i18n/navigation";
import { BookOpen, ArrowRight, Clock } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "courses" });
  return { title: t("title") };
}

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("courses");

  const courses = [
    {
      titleKey: "course1Title",
      descKey: "course1Desc",
      levelKey: "course1Level",
    },
    {
      titleKey: "course2Title",
      descKey: "course2Desc",
      levelKey: "course2Level",
    },
    {
      titleKey: "course3Title",
      descKey: "course3Desc",
      levelKey: "course3Level",
    },
    {
      titleKey: "course4Title",
      descKey: "course4Desc",
      levelKey: "course4Level",
    },
  ] as const;

  return (
    <>
      <section className="border-b border-[var(--color-border)] py-16 md:py-24">
        <Container>
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-brand-700)]">
            {t("eyebrow")}
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--color-muted)]">
            {t("subtitle")}
          </p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-100)] px-3 py-1 text-xs font-medium text-[var(--color-accent-700)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-600)]" />
            {t("comingSoonBadge")}
          </span>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((c) => (
              <article
                key={c.titleKey}
                className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-7 transition hover:border-[var(--color-brand-600)] hover:shadow-md"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-semibold tracking-tight">
                  {t(c.titleKey)}
                </h2>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {t(c.descKey)}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-[var(--color-foreground)]/70">
                  <Clock className="h-3.5 w-3.5" />
                  {t(c.levelKey)}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 grid gap-10 rounded-3xl border border-[var(--color-border)] bg-[var(--color-subtle)]/50 p-8 md:grid-cols-3 md:p-12">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-semibold tracking-tight">
                {t("format")}
              </h3>
              <p className="mt-4 text-[var(--color-muted)]">{t("formatBody")}</p>
            </div>
            <div className="flex md:justify-end">
              <Link
                href="/contact"
                className="inline-flex h-fit items-center gap-2 self-start rounded-full bg-[var(--color-brand-700)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--color-brand-800)] md:self-center"
              >
                {t("notifyCta")}
                <ArrowRight className="h-4 w-4 flip-rtl" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
