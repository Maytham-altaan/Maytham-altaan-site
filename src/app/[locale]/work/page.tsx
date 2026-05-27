import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/Container";
import { siteConfig } from "@/lib/site-config";
import {
  ScanSearch,
  Film,
  Flame,
  AppWindow,
  ExternalLink,
  Hospital,
  Store,
  GraduationCap,
  BookMarked,
  FileEdit,
  Users,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "work" });
  return { title: t("title") };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("work");

  const apps = [
    {
      icon: ScanSearch,
      titleKey: "appDetectorTitle",
      tagKey: "appDetectorTag",
      descKey: "appDetectorDesc",
      url: siteConfig.products.aiDetector,
      tone: "accent" as const,
    },
    {
      icon: Film,
      titleKey: "appCinematiTitle",
      tagKey: "appCinematiTag",
      descKey: "appCinematiDesc",
      url: siteConfig.apps.find((a) => a.key === "cinemati")?.url ?? "#",
      tone: "brand" as const,
    },
    {
      icon: Flame,
      titleKey: "appCalorieTitle",
      tagKey: "appCalorieTag",
      descKey: "appCalorieDesc",
      url: siteConfig.apps.find((a) => a.key === "calorie")?.url ?? "#",
      tone: "brand" as const,
    },
    {
      icon: AppWindow,
      titleKey: "appResidipokTitle",
      tagKey: "appResidipokTag",
      descKey: "appResidipokDesc",
      url: siteConfig.apps.find((a) => a.key === "residipok")?.url ?? "#",
      tone: "brand" as const,
    },
  ];

  const roles = [
    {
      icon: Hospital,
      titleKey: "role1Title",
      orgKey: "role1Org",
      periodKey: "role1Period",
      descKey: "role1Desc",
    },
    {
      icon: Store,
      titleKey: "role2Title",
      orgKey: "role2Org",
      periodKey: "role2Period",
      descKey: "role2Desc",
    },
    {
      icon: GraduationCap,
      titleKey: "role3Title",
      orgKey: "role3Org",
      periodKey: "role3Period",
      descKey: "role3Desc",
    },
  ];

  const academic = [
    { icon: FileEdit, titleKey: "academic1Title", orgKey: "academic1Org" },
    { icon: BookMarked, titleKey: "academic2Title", orgKey: "academic2Org" },
    { icon: Users, titleKey: "academic3Title", orgKey: "academic3Org" },
  ];

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
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {t("appsHeading")}
            </h2>
            <p className="mt-3 text-[var(--color-muted)]">
              {t("appsSubheading")}
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {apps.map((app) => {
              const Icon = app.icon;
              const isAccent = app.tone === "accent";
              return (
                <a
                  key={app.titleKey}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-7 transition hover:-translate-y-0.5 hover:border-[var(--color-brand-600)] hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${
                        isAccent
                          ? "bg-[var(--color-accent-100)] text-[var(--color-accent-700)]"
                          : "bg-[var(--color-brand-100)] text-[var(--color-brand-700)]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <ExternalLink className="h-4 w-4 text-[var(--color-muted)] transition group-hover:text-[var(--color-brand-700)]" />
                  </div>
                  <div className="mt-5 text-xs font-medium uppercase tracking-wider text-[var(--color-brand-700)]">
                    {t(app.tagKey)}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight">
                    {t(app.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {t(app.descKey)}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-brand-700)]">
                    {t("appOpenCta")}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </span>
                </a>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-subtle)]/40 py-16 md:py-20">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {t("rolesHeading")}
            </h2>
            <p className="mt-3 text-[var(--color-muted)]">
              {t("rolesSubheading")}
            </p>
          </div>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {roles.map((r) => {
              const Icon = r.icon;
              return (
                <li
                  key={r.titleKey}
                  className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-7"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-5 text-xs font-medium uppercase tracking-wider text-[var(--color-brand-700)]">
                    {t(r.periodKey)}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight">
                    {t(r.titleKey)}
                  </h3>
                  <div className="mt-0.5 text-sm font-medium text-[var(--color-foreground)]/80">
                    {t(r.orgKey)}
                  </div>
                  <p className="mt-3 text-sm text-[var(--color-muted)]">
                    {t(r.descKey)}
                  </p>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {t("academicHeading")}
            </h2>
            <p className="mt-3 text-[var(--color-muted)]">
              {t("academicSubheading")}
            </p>
          </div>
          <ul className="mt-10 divide-y divide-[var(--color-border)] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)]">
            {academic.map((a) => {
              const Icon = a.icon;
              return (
                <li
                  key={a.titleKey}
                  className="flex items-start gap-4 p-6"
                >
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-base font-semibold tracking-tight">
                      {t(a.titleKey)}
                    </div>
                    <div className="mt-1 text-sm text-[var(--color-muted)]">
                      {t(a.orgKey)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="mt-12 text-center text-sm italic text-[var(--color-muted)]">
            {t("viewMore")}
          </p>
        </Container>
      </section>
    </>
  );
}
