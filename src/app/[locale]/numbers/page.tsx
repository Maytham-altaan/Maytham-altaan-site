import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/Container";
import { siteConfig } from "@/lib/site-config";
import { getGithubStats } from "@/lib/github";
import { getApps } from "@/lib/appstore";
import {
  Stethoscope,
  Sparkles,
  AppWindow,
  GitBranch,
  Star,
  FileText,
  ExternalLink,
  Clock,
} from "lucide-react";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "numbers" });
  return { title: t("title") };
}

const PHARMACY_START_YEAR = 2017;
const PEER_REVIEWED_MANUSCRIPTS = 3; // From CV: Wiley Health Science Reports 2023

function formatRelative(iso: string, locale: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const seconds = Math.max(1, Math.floor((now - then) / 1000));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (days > 0) return rtf.format(-days, "day");
  if (hours > 0) return rtf.format(-hours, "hour");
  if (minutes > 0) return rtf.format(-minutes, "minute");
  return rtf.format(-seconds, "second");
}

export default async function NumbersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("numbers");

  const [stats, apps] = await Promise.all([getGithubStats(), getApps()]);
  const appCount = apps.length || 3;
  const yearsPracticing = new Date().getFullYear() - PHARMACY_START_YEAR;

  const cards = [
    {
      icon: Stethoscope,
      value: yearsPracticing.toString(),
      label: t("yearsPharmacyLabel"),
      tone: "brand" as const,
      live: false,
    },
    {
      icon: AppWindow,
      value: appCount.toString(),
      label: t("appsLabel"),
      tone: "brand" as const,
      live: true,
    },
    {
      icon: Sparkles,
      value: "1",
      label: t("toolsLabel"),
      tone: "accent" as const,
      live: false,
    },
    {
      icon: GitBranch,
      value: stats.ok ? stats.publicRepos.toString() : "—",
      label: t("reposLabel"),
      tone: "brand" as const,
      live: true,
    },
    {
      icon: Star,
      value: stats.ok ? stats.totalStars.toString() : "—",
      label: t("starsLabel"),
      tone: "accent" as const,
      live: true,
    },
    {
      icon: FileText,
      value: PEER_REVIEWED_MANUSCRIPTS.toString(),
      label: t("manuscriptsLabel"),
      tone: "brand" as const,
      live: false,
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--color-border)] py-16 md:py-24">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
        >
          <div className="absolute -top-32 start-1/4 h-[24rem] w-[24rem] rounded-full bg-[var(--color-brand-200)]/40 blur-3xl" />
          <div className="absolute -bottom-24 end-1/4 h-[20rem] w-[20rem] rounded-full bg-[var(--color-accent-200)]/40 blur-3xl" />
        </div>
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => {
              const Icon = c.icon;
              const isAccent = c.tone === "accent";
              return (
                <div
                  key={c.label}
                  className="relative flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-7"
                >
                  {c.live && (
                    <span className="absolute top-4 end-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-100)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-brand-800)]">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-brand-500)] opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-brand-600)]" />
                      </span>
                      {t("liveBadge")}
                    </span>
                  )}
                  <div
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${
                      isAccent
                        ? "bg-[var(--color-accent-100)] text-[var(--color-accent-700)]"
                        : "bg-[var(--color-brand-100)] text-[var(--color-brand-700)]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-6 text-4xl font-semibold tracking-tight tabular-nums text-[var(--color-foreground)] md:text-5xl">
                    {c.value}
                  </div>
                  <div className="mt-2 text-sm text-[var(--color-muted)]">
                    {c.label}
                  </div>
                </div>
              );
            })}
          </div>

          {stats.ok && stats.latestRepo && (
            <div className="mt-12 rounded-3xl border border-[var(--color-border)] bg-[var(--color-subtle)]/50 p-8 md:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
                    <GitBranch className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-700)]">
                      {t("latestRepoEyebrow")}
                    </div>
                    <div className="text-base font-semibold tracking-tight text-[var(--color-foreground)]">
                      {stats.latestRepo.name}
                    </div>
                  </div>
                </div>
                <a
                  href={stats.latestRepo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1.5 text-xs font-medium text-[var(--color-foreground)]/80 transition hover:border-[var(--color-brand-600)] hover:text-[var(--color-brand-700)]"
                >
                  {t("viewOnGithub")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {stats.latestRepo.description && (
                <p className="mt-4 text-[var(--color-muted)]">
                  {stats.latestRepo.description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--color-muted)]">
                {stats.latestRepo.language && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-brand-500)]" />
                    {stats.latestRepo.language}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-3 w-3" />
                  {stats.latestRepo.stars}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {formatRelative(stats.latestRepo.updatedAt, locale)}
                </span>
              </div>
            </div>
          )}

          <div className="mt-12 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {t("updatedNote")}
            </span>
            <a
              href={siteConfig.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium hover:text-[var(--color-brand-700)]"
            >
              <GitBranch className="h-3.5 w-3.5" />
              {t("viewProfile")}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
