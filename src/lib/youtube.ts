import { siteConfig } from "./site-config";

export type YouTubeVideo = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  publishedAt: string;
};

const REVALIDATE_SECONDS = 3600; // 1 hour

function extractMatches(xml: string, tag: string): string[] {
  // Captures the inner text between <tag>...</tag> across the whole document
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "g");
  const out: string[] = [];
  let m;
  while ((m = re.exec(xml)) !== null) out.push(m[1]);
  return out;
}

export async function getYouTubeVideos(
  limit = 4
): Promise<YouTubeVideo[]> {
  const channelId = siteConfig.youtubeChannelId;
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    if (!res.ok) return [];
    const xml = await res.text();
    const entries = extractMatches(xml, "entry");
    const videos: YouTubeVideo[] = [];
    for (const entry of entries) {
      const id = /<yt:videoId>([^<]+)<\/yt:videoId>/.exec(entry)?.[1];
      const title = /<title>([^<]+)<\/title>/.exec(entry)?.[1];
      const link = /<link[^>]*href="([^"]+)"/.exec(entry)?.[1];
      const published = /<published>([^<]+)<\/published>/.exec(entry)?.[1];
      if (!id || !title) continue;
      videos.push({
        id,
        title: title.trim(),
        url: link ?? `https://www.youtube.com/watch?v=${id}`,
        thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
        publishedAt: published ?? "",
      });
      if (videos.length >= limit) break;
    }
    return videos;
  } catch {
    return [];
  }
}
