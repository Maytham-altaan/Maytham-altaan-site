/**
 * Fetches recent pre-prints from medRxiv (where bleeding-edge medical
 * research lives before peer review). Used as an emerging-trends signal
 * for the research-ideas generator — pre-prints reveal what researchers
 * are actively investigating right now.
 */

export type Preprint = {
  title: string;
  category: string;
  date: string;
};

const REVALIDATE_SECONDS = 21600; // 6 hours — medRxiv updates daily

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function getRecentPreprints(limit = 60): Promise<Preprint[]> {
  const start = isoDaysAgo(30);
  const end = isoDaysAgo(0);
  try {
    const res = await fetch(
      `https://api.medrxiv.org/details/medrxiv/${start}/${end}/0/json`,
      {
        next: { revalidate: REVALIDATE_SECONDS },
        headers: { "user-agent": "Mozilla/5.0 (maytham-altaan.com bot)" },
      }
    );
    if (!res.ok) return [];
    type ApiResp = {
      collection?: Array<{ title?: string; category?: string; date?: string }>;
    };
    const data = (await res.json()) as ApiResp;
    const items = data.collection ?? [];
    // De-duplicate by title (medRxiv lists each version separately)
    const seen = new Set<string>();
    const out: Preprint[] = [];
    for (const it of items) {
      const title = (it.title ?? "").trim();
      if (!title || seen.has(title)) continue;
      seen.add(title);
      out.push({
        title,
        category: (it.category ?? "").trim(),
        date: (it.date ?? "").trim(),
      });
      if (out.length >= limit) break;
    }
    return out;
  } catch {
    return [];
  }
}

/** Loose mapping from our FIBMS specialty keys to medRxiv categories.
 *  Used to surface only relevant pre-prints to the LLM (saves tokens). */
const SPECIALTY_TO_CATEGORIES: Record<string, string[]> = {
  "internal-medicine": ["internal medicine", "general practice and family practice"],
  cardiology: ["cardiovascular medicine"],
  endocrinology: ["endocrinology"],
  gastroenterology: ["gastroenterology"],
  nephrology: ["nephrology"],
  pulmonology: ["respiratory medicine"],
  hematology: ["hematology"],
  oncology: ["oncology"],
  neurology: ["neurology"],
  "infectious-diseases": ["infectious diseases", "hiv aids"],
  rheumatology: ["rheumatology"],
  "general-surgery": ["surgery"],
  "orthopedic-surgery": ["orthopedics"],
  neurosurgery: ["neurosurgery"],
  urology: ["urology"],
  "vascular-surgery": ["surgery"],
  "pediatric-surgery": ["pediatrics", "surgery"],
  "plastic-surgery": ["surgery"],
  "cardiothoracic-surgery": ["cardiovascular medicine", "surgery"],
  pediatrics: ["pediatrics"],
  obgyn: ["obstetrics and gynecology"],
  anesthesia: ["anesthesia"],
  "critical-care": ["intensive care and critical care medicine"],
  ophthalmology: ["ophthalmology"],
  ent: ["otolaryngology"],
  dermatology: ["dermatology"],
  psychiatry: ["psychiatry and clinical psychology"],
  "family-medicine": ["general practice and family practice"],
  "emergency-medicine": ["emergency medicine"],
  radiology: ["radiology and imaging"],
  pathology: ["pathology"],
  "clinical-pharmacy": ["pharmacology and therapeutics"],
  "medical-microbiology": ["infectious diseases", "microbiology"],
  "community-medicine": ["public and global health", "epidemiology"],
};

export function filterPreprintsBySpecialty(
  preprints: Preprint[],
  specialty: string
): Preprint[] {
  const allowed = SPECIALTY_TO_CATEGORIES[specialty];
  if (!allowed || allowed.length === 0) return preprints;
  const lower = allowed.map((s) => s.toLowerCase());
  const matched = preprints.filter((p) =>
    lower.some((a) => p.category.toLowerCase().includes(a))
  );
  // If no specialty match found in this batch, fall back to all (better
  // than no signal).
  return matched.length > 0 ? matched : preprints;
}
