import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { listApprovedCaseSlugs } from "@/lib/cases/queries";
import { POLICY_DOCS } from "@/content/case-policies";

// Refresh the sitemap hourly so newly-approved cases appear for crawlers.
export const revalidate = 3600;

const LOCALES = ["en", "ar"] as const;

// Public, indexable routes (admin / auth / api are intentionally excluded).
const STATIC_PATHS = [
  "",
  "/about",
  "/courses",
  "/ai-detector",
  "/work",
  "/services",
  "/numbers",
  "/research-ideas",
  "/cases",
  "/cases/submit",
  "/cases/policies",
  ...POLICY_DOCS.map((d) => `/cases/policies/${d.slug}`),
  "/contact",
];

function langAlternates(path: string) {
  return {
    languages: {
      en: `${siteConfig.siteUrl}/en${path}`,
      ar: `${siteConfig.siteUrl}/ar${path}`,
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.siteUrl;
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${base}/${locale}${path}`,
        changeFrequency: path === "" || path === "/cases" ? "daily" : "weekly",
        priority: path === "" ? 1 : 0.7,
        alternates: langAlternates(path),
      });
    }
  }

  const cases = await listApprovedCaseSlugs();
  for (const c of cases) {
    const path = `/cases/${c.slug}`;
    for (const locale of LOCALES) {
      entries.push({
        url: `${base}/${locale}${path}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : undefined,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: langAlternates(path),
      });
    }
  }

  return entries;
}
