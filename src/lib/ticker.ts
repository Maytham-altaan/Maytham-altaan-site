import { getTranslations } from "next-intl/server";
import { siteConfig } from "./site-config";
import { getGithubStats } from "./github";
import { getApps } from "./appstore";
import type { TickerItem } from "@/components/NewsTicker";

export async function getTickerItems(locale: string): Promise<TickerItem[]> {
  const t = await getTranslations({ locale, namespace: "ticker" });
  const [stats, apps] = await Promise.all([getGithubStats(), getApps()]);
  // Fallback to 3 (current known apps) if iTunes lookup ever fails.
  const appCount = apps.length || 3;

  const items: TickerItem[] = [
    {
      iconKey: "ai",
      text: t("aiDetectorMsg"),
      href: "/ai-detector",
    },
    {
      iconKey: "apps",
      text: t("appsMsg", { count: appCount }),
      href: "/work",
    },
    {
      iconKey: "youtube",
      text: t("youtubeMsg"),
      href: siteConfig.social.youtube,
      external: true,
    },
  ];

  if (stats.ok && stats.latestRepo) {
    items.unshift({
      iconKey: "github",
      text: t("latestRepoMsg", { name: stats.latestRepo.name }),
      href: stats.latestRepo.url,
      external: true,
    });
  }

  return items;
}
