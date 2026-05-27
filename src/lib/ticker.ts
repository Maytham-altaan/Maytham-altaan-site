import { getTranslations } from "next-intl/server";
import { siteConfig } from "./site-config";
import { getGithubStats } from "./github";
import type { TickerItem } from "@/components/NewsTicker";

export async function getTickerItems(locale: string): Promise<TickerItem[]> {
  const t = await getTranslations({ locale, namespace: "ticker" });
  const stats = await getGithubStats();

  const items: TickerItem[] = [
    {
      iconKey: "ai",
      text: t("aiDetectorMsg"),
      href: "/ai-detector",
    },
    {
      iconKey: "apps",
      text: t("appsMsg", { count: siteConfig.apps.length }),
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
