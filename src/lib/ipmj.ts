/**
 * Fetches recent articles from the Iraqi Postgraduate Medical Journal (IPMJ).
 * Used as novelty/context grounding for the research-ideas generator —
 * the LLM sees what's been recently published so it can suggest NEW ideas
 * that don't duplicate existing work.
 */

export type IpmjArticle = {
  title: string;
  link: string;
  description: string;
};

const REVALIDATE_SECONDS = 86400; // 24 hours — IPMJ doesn't publish daily

function decode(s: string): string {
  // Strip CDATA wrapper and common HTML entities. IPMJ feed is plain XML
  // with the abstract inside <description>...</description>.
  return s
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function pickAll(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "g");
  const out: string[] = [];
  let m;
  while ((m = re.exec(xml)) !== null) out.push(m[1]);
  return out;
}

function pickOne(xml: string, tag: string): string {
  const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`).exec(xml);
  return m ? m[1] : "";
}

export async function getIpmjArticles(limit = 80): Promise<IpmjArticle[]> {
  try {
    const res = await fetch("https://ipmj.org/ju.rss", {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { "user-agent": "Mozilla/5.0 (maytham-altaan.com bot)" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = pickAll(xml, "item");
    const articles: IpmjArticle[] = items.slice(0, limit).map((entry) => ({
      title: decode(pickOne(entry, "title")),
      link: decode(pickOne(entry, "link")),
      description: decode(pickOne(entry, "description")).slice(0, 600),
    }));
    return articles.filter((a) => a.title);
  } catch {
    return [];
  }
}
