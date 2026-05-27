import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/Container";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import {
  GraduationCap,
  Sparkles,
  Briefcase,
  Stethoscope,
  ArrowRight,
} from "lucide-react";

const SERVICES = [
  {
    href: "/courses",
    icon: GraduationCap,
    titleKey: "service1Title",
    descKey: "service1Desc",
    tone: "brand",
  },
  {
    href: "/ai-detector",
    icon: Sparkles,
    titleKey: "service2Title",
    descKey: "service2Desc",
    tone: "accent",
  },
  {
    href: "/work",
    icon: Briefcase,
    titleKey: "service3Title",
    descKey: "service3Desc",
    tone: "brand",
  },
  {
    href: "/services",
    icon: Stethoscope,
    titleKey: "service4Title",
    descKey: "service4Desc",
    tone: "brand",
  },
] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--color-border)]">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
        >
          <div className="absolute -top-32 start-1/3 h-[28rem] w-[28rem] rounded-full bg-[var(--color-brand-200)]/40 blur-3xl" />
          <div className="absolute -bottom-24 end-1/4 h-[20rem] w-[20rem] rounded-full bg-[var(--color-accent-200)]/40 blur-3xl" />
        </div>
        <Container className="py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-background)]/70 px-3 py-1 text-xs font-medium tracking-wide text-[var(--color-brand-700)] uppercase">
              {t("heroEyebrow")}
            </div>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-5xl md:text-6xl md:leading-[1.1]">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg text-[var(--color-muted)] md:text-xl">
              {t("heroSubtitle")}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-700)] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--color-brand-800)]"
              >
                {t("heroCtaPrimary")}
                <ArrowRight className="h-4 w-4 flip-rtl" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-5 py-3 text-sm font-medium text-[var(--color-foreground)] transition hover:border-[var(--color-brand-600)] hover:text-[var(--color-brand-700)]"
              >
                {t("heroCtaSecondary")}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-brand-700)]">
              {t("servicesEyebrow")}
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              {t("servicesTitle")}
            </h2>
            <p className="mt-4 text-[var(--color-muted)]">
              {t("servicesSubtitle")}
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              const isAccent = service.tone === "accent";
              return (
                <Link
                  key={service.href}
                  href={service.href}
                  className="group relative flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 transition hover:-translate-y-0.5 hover:border-[var(--color-brand-600)] hover:shadow-md"
                >
                  <div
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${
                      isAccent
                        ? "bg-[var(--color-accent-100)] text-[var(--color-accent-700)]"
                        : "bg-[var(--color-brand-100)] text-[var(--color-brand-700)]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">
                    {t(service.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {t(service.descKey)}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-brand-700)]">
                    {t("learnMore")}
                    <ArrowRight className="h-4 w-4 flip-rtl transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-y border-[var(--color-border)] bg-[var(--color-subtle)]/40 py-20 md:py-24">
        <Container>
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-brand-700)]">
                {t("aboutEyebrow")}
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                {t("aboutTitle")}
              </h2>
              <p className="mt-5 text-[var(--color-muted)] md:text-lg">
                {t("aboutBody")}
              </p>
              <Link
                href="/about"
                className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand-700)] hover:text-[var(--color-brand-800)]"
              >
                {t("aboutCta")}
                <ArrowRight className="h-4 w-4 flip-rtl" />
              </Link>
            </div>
            <div className="relative md:justify-self-end">
              <div className="relative w-full max-w-sm rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-brand-100)] via-[var(--color-background)] to-[var(--color-accent-100)] p-1.5 shadow-sm">
                <ProfilePhoto
                  size={480}
                  rounded="rounded-[1.4rem]"
                  className="aspect-[4/5] w-full"
                />
              </div>
              <div className="mt-4 text-center text-sm text-[var(--color-muted)] md:text-end">
                {t("photoCaption")}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-24">
        <Container>
          <div className="rounded-3xl bg-[var(--color-brand-800)] px-8 py-14 text-center md:px-16 md:py-20">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-white md:text-4xl">
              {t("ctaTitle")}
            </h2>
            <p className="mt-4 text-[var(--color-brand-100)] md:text-lg">
              {t("ctaSubtitle")}
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-500)] px-6 py-3 text-sm font-semibold text-[var(--color-accent-900,_#451a03)] transition hover:bg-[var(--color-accent-400)]"
            >
              {t("ctaButton")}
              <ArrowRight className="h-4 w-4 flip-rtl" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
