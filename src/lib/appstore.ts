import { siteConfig } from "./site-config";

export type AppEntry = {
  trackId: string;
  trackName: string;
  url: string;
  artworkUrl: string;
  shortDescription: string;
  genre: string;
  releaseDate: string;
};

const REVALIDATE_SECONDS = 86400; // 24 hours — App Store metadata changes rarely

function summarize(description: string, max = 160): string {
  if (!description) return "";
  const cleaned = description.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  const cut = cleaned.slice(0, max);
  const lastStop = Math.max(
    cut.lastIndexOf(". "),
    cut.lastIndexOf("! "),
    cut.lastIndexOf("? "),
    cut.lastIndexOf("؟ "),
    cut.lastIndexOf("، ")
  );
  if (lastStop > 60) return cut.slice(0, lastStop + 1);
  const lastSpace = cut.lastIndexOf(" ");
  return cut.slice(0, lastSpace > 0 ? lastSpace : max) + "…";
}

/**
 * Fetches ALL apps under the developer's artistId from iTunes Search API.
 * Auto-discovers new apps — no code change needed when Maytham publishes another.
 */
export async function getApps(): Promise<AppEntry[]> {
  try {
    const res = await fetch(
      `https://itunes.apple.com/lookup?id=${siteConfig.appleArtistId}&entity=software&country=us`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    if (!res.ok) return [];

    type LookupResult = {
      wrapperType: string;
      trackId?: number;
      trackName?: string;
      trackViewUrl?: string;
      artworkUrl512?: string;
      artworkUrl100?: string;
      description?: string;
      primaryGenreName?: string;
      releaseDate?: string;
    };

    const data = (await res.json()) as { results: LookupResult[] };
    const apps: AppEntry[] = data.results
      .filter((r) => r.wrapperType === "software" && r.trackId && r.trackName)
      .map((r) => ({
        trackId: String(r.trackId),
        trackName: r.trackName!,
        url: r.trackViewUrl ?? `https://apps.apple.com/app/id${r.trackId}`,
        artworkUrl: r.artworkUrl512 ?? r.artworkUrl100 ?? "",
        shortDescription: summarize(r.description ?? ""),
        genre: r.primaryGenreName ?? "iOS",
        releaseDate: r.releaseDate ?? "",
      }))
      // Newest first
      .sort((a, b) => (a.releaseDate < b.releaseDate ? 1 : -1));

    return apps;
  } catch {
    return [];
  }
}
