import { getTranslations } from "next-intl/server";
import { Container } from "@/components/Container";
import { getInstagramPosts } from "@/lib/instagram";
import { siteConfig } from "@/lib/site-config";
import { Camera, Play, ExternalLink } from "lucide-react";

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}

export async function InstagramShowcase({ locale }: { locale: string }) {
  const posts = await getInstagramPosts(6);
  const t = await getTranslations({ locale, namespace: "instagramShowcase" });
  const profileUrl = siteConfig.social.instagram;

  /* No Behold feed configured → render a clean Follow CTA */
  if (posts.length === 0) {
    return (
      <section className="border-y border-[var(--color-border)] bg-[var(--color-subtle)]/40 py-16 md:py-20">
        <Container>
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-orange-500/10 px-8 py-12 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 text-white shadow-md">
              <Camera className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-brand-700)]">
                {t("eyebrow")}
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                {t("ctaTitle")}
              </h2>
              <p className="mt-3 max-w-xl text-[var(--color-muted)]">
                {t("ctaBody")}
              </p>
            </div>
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-pink-600 hover:to-purple-700"
            >
              <Camera className="h-4 w-4" />
              {t("ctaButton")}
            </a>
          </div>
        </Container>
      </section>
    );
  }

  /* Behold feed configured → render the live grid */
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
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)]/85 transition hover:border-[var(--color-brand-600)] hover:text-[var(--color-brand-700)]"
          >
            {t("viewProfile")}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {posts.map((post) => {
            const isVideo =
              post.mediaType === "VIDEO" || post.mediaType === "REEL";
            return (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                title={truncate(post.caption, 120)}
                className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-subtle)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.thumbnailUrl}
                  alt={truncate(post.caption, 80) || "Instagram post"}
                  loading="lazy"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                {isVideo && (
                  <div className="absolute end-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white">
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
              </a>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
