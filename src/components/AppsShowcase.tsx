import { getTranslations } from "next-intl/server";
import { Container } from "@/components/Container";
import { getApps } from "@/lib/appstore";
import { ExternalLink, AppWindow } from "lucide-react";

export async function AppsShowcase({ locale }: { locale: string }) {
  const apps = await getApps();
  if (apps.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "appsShowcase" });

  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-subtle)]/40 py-20 md:py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-brand-700)]">
              {t("eyebrow")}
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-3 text-[var(--color-muted)]">{t("subtitle")}</p>
          </div>
          <div className="text-xs text-[var(--color-muted)]">
            {t("liveNote")}
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <a
              key={app.key}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 transition hover:-translate-y-0.5 hover:border-[var(--color-brand-600)] hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                {app.artworkUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={app.artworkUrl}
                    alt={app.trackName}
                    width={72}
                    height={72}
                    loading="lazy"
                    className="h-[72px] w-[72px] shrink-0 rounded-2xl shadow-sm"
                  />
                ) : (
                  <div className="inline-flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
                    <AppWindow className="h-7 w-7" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-brand-700)]">
                    {app.genre}
                  </div>
                  <h3 className="mt-1 truncate text-lg font-semibold tracking-tight">
                    {app.trackName}
                  </h3>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-[var(--color-muted)] transition group-hover:text-[var(--color-brand-700)]" />
              </div>
              <p className="mt-5 line-clamp-4 text-sm text-[var(--color-muted)]">
                {app.shortDescription}
              </p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-brand-700)]">
                {t("openOnAppStore")}
                <ExternalLink className="h-3 w-3" />
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
