/**
 * Instagram doesn't expose a public RSS or anonymous API for reels.
 * The realistic path to auto-updating IG content is a free service like
 * Behold.so — sign in once with your Instagram, copy the feed ID, set
 * NEXT_PUBLIC_BEHOLD_FEED_ID in Vercel env vars. Posts/reels then
 * appear and refresh automatically.
 *
 * Without that env var, the InstagramShowcase component renders a
 * "Follow on Instagram" CTA instead.
 */

export type InstagramPost = {
  id: string;
  permalink: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REEL";
  mediaUrl: string;
  thumbnailUrl: string;
  caption: string;
  timestamp: string;
};

const REVALIDATE_SECONDS = 3600; // 1 hour

/* Behold.so JSON shape (their docs: https://docs.behold.so/) */
type BeholdPost = {
  id: string;
  permalink: string;
  mediaType: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  sizes?: { medium?: { mediaUrl?: string } };
  caption: string;
  timestamp: string;
};

export async function getInstagramPosts(
  limit = 6
): Promise<InstagramPost[]> {
  const feedId = process.env.NEXT_PUBLIC_BEHOLD_FEED_ID;
  if (!feedId) return [];

  try {
    const res = await fetch(`https://feeds.behold.so/${feedId}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { posts: BeholdPost[] };
    return (data.posts ?? []).slice(0, limit).map((p) => ({
      id: p.id,
      permalink: p.permalink,
      mediaType: (p.mediaType as InstagramPost["mediaType"]) ?? "IMAGE",
      mediaUrl: p.mediaUrl,
      thumbnailUrl:
        p.thumbnailUrl ?? p.sizes?.medium?.mediaUrl ?? p.mediaUrl,
      caption: p.caption ?? "",
      timestamp: p.timestamp ?? "",
    }));
  } catch {
    return [];
  }
}
