import { siteConfig } from "./site-config";

export type AppEntry = {
  key: string;
  appStoreId: string;
  url: string;
  trackName: string;
  artworkUrl: string;
  shortDescription: string;
  genre: string;
};

const REVALIDATE_SECONDS = 86400; // 24 hours — App Store metadata changes rarely

function summarize(description: string, max = 160): string {
  if (!description) return "";
  // Take the first sentence or up to max chars
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
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

export async function getApps(): Promise<AppEntry[]> {
  const ids = siteConfig.apps.map((a) => a.appStoreId).join(",");
  try {
    const res = await fetch(
      `https://itunes.apple.com/lookup?id=${ids}&country=us`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    if (!res.ok) return [];
    type LookupResult = {
      trackId: number;
      trackName: string;
      artworkUrl512?: string;
      artworkUrl100?: string;
      description?: string;
      primaryGenreName?: string;
    };
    const data = (await res.json()) as { results: LookupResult[] };
    // Map iTunes results back to our app config order
    return siteConfig.apps
      .map((a) => {
        const r = data.results.find(
          (x) => String(x.trackId) === a.appStoreId
        );
        if (!r) return null;
        return {
          key: a.key,
          appStoreId: a.appStoreId,
          url: a.url,
          trackName: r.trackName,
          artworkUrl: r.artworkUrl512 ?? r.artworkUrl100 ?? "",
          shortDescription: summarize(r.description ?? ""),
          genre: r.primaryGenreName ?? "iOS",
        } as AppEntry;
      })
      .filter((x): x is AppEntry => x !== null);
  } catch {
    return [];
  }
}
