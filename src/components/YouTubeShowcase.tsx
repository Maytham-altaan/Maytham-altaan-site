import { getTranslations } from "next-intl/server";
import { Container } from "@/components/Container";
import { getYouTubeVideos } from "@/lib/youtube";
import { siteConfig } from "@/lib/site-config";
import { PlayCircle, ExternalLink } from "lucide-react";

function formatDate(iso: string, locale: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export async function YouTubeShowcase({ locale }: { locale: string }) {
  const videos = await getYouTubeVideos(4);
  if (videos.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "youtubeShowcase" });

  return (
    <section className="py-20 md:py-24">
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
          <a
            href={siteConfig.social.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)]/85 transition hover:border-[var(--color-brand-600)] hover:text-[var(--color-brand-700)]"
          >
            {t("viewChannel")}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {videos.map((video) => (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] transition hover:-translate-y-0.5 hover:border-[var(--color-brand-600)] hover:shadow-md"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-[var(--color-subtle)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  width={480}
                  height={360}
                  loading="lazy"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#cc0000] shadow-lg opacity-90 transition group-hover:scale-110">
                    <PlayCircle className="h-7 w-7 fill-current" />
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 text-sm font-semibold tracking-tight">
                  {video.title}
                </h3>
                {video.publishedAt && (
                  <div className="mt-2 text-xs text-[var(--color-muted)]">
                    {formatDate(video.publishedAt, locale)}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
