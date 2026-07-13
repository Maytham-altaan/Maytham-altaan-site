/**
 * Research-idea generator for Iraqi/Arab board (FIBMS) students.
 * Combines two grounding sources — recent regional published research
 * (kept anonymous in the user-facing UI) and current pre-prints from
 * medRxiv (emerging-direction signal) — with a Groq LLM call to produce
 * 5 structured thesis ideas.
 */

import { getIpmjArticles } from "./ipmj";
import {
  getRecentPreprints,
  filterPreprintsBySpecialty,
} from "./medrxiv";

export type StudyDesign =
  | "any"
  | "rct"
  | "cohort"
  | "case-control"
  | "cross-sectional"
  | "case-series"
  | "systematic-review"
  | "qualitative";

export type ResearchInput = {
  specialty: string;
  subspecialty?: string;
  studyDesign: StudyDesign;
  constraints?: string;
  locale: string;
};

export type ResearchIdea = {
  titleEn: string;
  titleAr: string;
  background: string;
  researchQuestion: string;
  methodology: string;
  novelty: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** Optional — set by the LLM when the idea aligns with a current pre-print trend */
  emerging?: boolean;
};

export type ResearchResult = {
  ok: boolean;
  ideas: ResearchIdea[];
  /** Combined count of recent publications + pre-prints used as grounding */
  groundingCount: number;
  error?: string;
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are a senior clinical-research mentor advising Iraqi and Arab medical board (FIBMS) candidates on selecting a thesis topic. The Iraqi Board of Medical Specializations expects a thesis that is:

- Original (no obvious duplicate of recently published work in the region)
- Methodologically feasible within ~12 months at an Iraqi teaching hospital
- Clinically relevant (preferably with patient-care impact)
- Realistic in scope (sample size achievable, ethics-approval feasible)
- Aligned with the candidate's stated specialty

You are given TWO context lists:

1. RECENT REGIONAL PUBLICATIONS — work already published in the candidate's home region. Your ideas MUST NOT duplicate these. You may build on gaps, contradictions, or unexplored populations within them.

2. RECENT PRE-PRINTS (emerging research) — papers posted in the last 30 days that have NOT yet been peer-reviewed. They reveal what global researchers are actively investigating RIGHT NOW. Strongly prefer thesis ideas that align with this emerging direction — those have the best chance of (a) being publishable on completion, (b) fitting hot funding lines, and (c) catching the FIBMS committee's eye for being current. Mark such ideas with "emerging": true.

Return EXACTLY 5 thesis ideas as a JSON object with this exact shape (no markdown, no preamble, just JSON):

{
  "ideas": [
    {
      "titleEn": "...",
      "titleAr": "...",
      "background": "2-3 sentence rationale referencing why this matters in the Iraqi/Arab clinical context",
      "researchQuestion": "one crisp PICO-style question",
      "methodology": "study design + setting + sample size estimate + key variables + analysis plan, in ~4 sentences",
      "novelty": "1-2 sentences explicitly stating what gap this fills",
      "difficulty": 1-5 integer (1 = easy resident project, 5 = ambitious multi-center),
      "emerging": true | false (true if it aligns with a current pre-print trend)
    },
    ... 4 more
  ]
}

Aim for at least 2 of the 5 ideas to be "emerging": true. Write titleAr in formal Modern Standard Arabic. All other fields in clear English. No fluff, no emojis, no markdown.`;

function buildUserPrompt(
  input: ResearchInput,
  regionalTitles: string[],
  preprintTitles: string[]
): string {
  const regional = regionalTitles.length
    ? `RECENT REGIONAL PUBLICATIONS (do NOT duplicate these — generate ideas that fill gaps):\n${regionalTitles
        .slice(0, 50)
        .map((t, i) => `${i + 1}. ${t}`)
        .join("\n")}`
    : "(Regional publication context unavailable this run.)";

  const preprints = preprintTitles.length
    ? `\n\nRECENT PRE-PRINTS — emerging trends in the last 30 days (prefer ideas that align with these directions):\n${preprintTitles
        .slice(0, 30)
        .map((t, i) => `${i + 1}. ${t}`)
        .join("\n")}`
    : "\n\n(Pre-print context unavailable this run — rely on general knowledge of current research trends.)";

  return `${regional}${preprints}

CANDIDATE PROFILE:
- Specialty: ${input.specialty}
- Subspecialty / interest area: ${input.subspecialty || "(none specified — give a mix across the specialty)"}
- Preferred study design: ${input.studyDesign === "any" ? "any design — pick what best fits each idea" : input.studyDesign}
- Constraints: ${input.constraints || "(none — assume standard Iraqi teaching hospital setting, 12-month timeline)"}

Generate 5 novel, feasible, clinically meaningful FIBMS thesis ideas now. Return ONLY the JSON object described in the system message.`;
}

export async function generateResearchIdeas(
  input: ResearchInput
): Promise<ResearchResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      ideas: [],
      groundingCount: 0,
      error:
        "GROQ_API_KEY is not configured. Add it in Vercel Project Settings → Environment Variables.",
    };
  }

  // 1. Pull both grounding sources in parallel.
  const [regional, allPreprints] = await Promise.all([
    getIpmjArticles(80),
    getRecentPreprints(120),
  ]);
  const regionalTitles = regional.map((a) => a.title);
  const preprintTitles = filterPreprintsBySpecialty(
    allPreprints,
    input.specialty
  ).map((p) => p.title);
  const groundingCount = regionalTitles.length + preprintTitles.length;

  // 2. Call Groq for structured ideas.
  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: buildUserPrompt(input, regionalTitles, preprintTitles),
          },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return {
        ok: false,
        ideas: [],
        groundingCount,
        error: `Groq API error ${res.status}: ${detail.slice(0, 200)}`,
      };
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content ?? "";
    let parsed: { ideas?: ResearchIdea[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        ok: false,
        ideas: [],
        groundingCount,
        error: "LLM returned non-JSON output. Please retry.",
      };
    }

    const ideas = Array.isArray(parsed.ideas) ? parsed.ideas.slice(0, 5) : [];
    return {
      ok: ideas.length > 0,
      ideas,
      groundingCount,
    };
  } catch (e) {
    return {
      ok: false,
      ideas: [],
      groundingCount,
      error:
        e instanceof Error ? e.message : "Unknown error calling the LLM.",
    };
  }
}

/** Simple in-memory rate-limit. Best-effort only — Vercel cold starts reset it. */
const HITS = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

export function checkRateLimit(ip: string): {
  ok: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = HITS.get(ip);
  if (!entry || entry.resetAt < now) {
    HITS.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: MAX_PER_WINDOW - 1, resetAt: now + WINDOW_MS };
  }
  if (entry.count >= MAX_PER_WINDOW) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count += 1;
  return { ok: true, remaining: MAX_PER_WINDOW - entry.count, resetAt: entry.resetAt };
}

/** FIBMS-aligned specialty list. Localized labels at render time. */
export const SPECIALTIES = [
  "internal-medicine",
  "cardiology",
  "endocrinology",
  "gastroenterology",
  "nephrology",
  "pulmonology",
  "hematology",
  "oncology",
  "neurology",
  "infectious-diseases",
  "rheumatology",
  "general-surgery",
  "orthopedic-surgery",
  "neurosurgery",
  "urology",
  "vascular-surgery",
  "pediatric-surgery",
  "plastic-surgery",
  "cardiothoracic-surgery",
  "pediatrics",
  "obgyn",
  "anesthesia",
  "critical-care",
  "ophthalmology",
  "ent",
  "dermatology",
  "psychiatry",
  "family-medicine",
  "emergency-medicine",
  "radiology",
  "pathology",
  "clinical-pharmacy",
  "medical-microbiology",
  "community-medicine",
] as const;

export type Specialty = (typeof SPECIALTIES)[number];

// ---------------------------------------------------------------------------
// Guideline evidence gaps — grounded on Europe PMC (real, current sources),
// synthesised by Cerebras GLM. The model only picks WHICH source a gap comes
// from; the citation (title/link) is supplied by us, so links can't be faked.
// ---------------------------------------------------------------------------

const CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions";
const CEREBRAS_MODEL = process.env.CEREBRAS_MODEL || "zai-glm-4.7";

export type GuidelineGap = {
  gap: string;
  why: string;
  citation: { title: string; url: string; year?: string };
};

type EpmcHit = {
  title?: string;
  abstractText?: string;
  pmid?: string;
  doi?: string;
  id?: string;
  source?: string;
  journalTitle?: string;
  pubYear?: string;
};

function epmcUrl(h: EpmcHit): string {
  if (h.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${h.pmid}/`;
  if (h.doi) return `https://doi.org/${h.doi}`;
  if (h.source && h.id) return `https://europepmc.org/article/${h.source}/${h.id}`;
  return "https://europepmc.org/";
}

async function fetchGuidelineSources(topic: string): Promise<EpmcHit[]> {
  const query = `(${topic}) AND (guideline OR "systematic review" OR consensus OR recommendations)`;
  const url =
    `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}` +
    `&format=json&resultType=core&pageSize=12&sort=${encodeURIComponent("P_PDATE_D desc")}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as { resultList?: { result?: EpmcHit[] } };
    return (data.resultList?.result ?? []).filter((h) => h.title).slice(0, 20);
  } catch {
    return [];
  }
}

export async function findGuidelineGaps(
  input: ResearchInput,
  diag?: string[]
): Promise<GuidelineGap[]> {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) {
    diag?.push("no CEREBRAS_API_KEY");
    return [];
  }
  const topic = [input.subspecialty, input.specialty.replace(/-/g, " ")]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (!topic) {
    diag?.push("empty topic");
    return [];
  }

  const all = await fetchGuidelineSources(topic);
  diag?.push(`sources=${all.length}`);
  if (!all.length) return [];
  const sources = all.slice(0, 8);

  const list = sources
    .map(
      (h, i) =>
        `[${i + 1}] ${h.title} (${h.pubYear || ""})\n${(h.abstractText || "No abstract.")
          .replace(/\s+/g, " ")
          .slice(0, 700)}`
    )
    .join("\n\n");

  const system = `You are a clinical evidence expert. Below are recent guideline/review sources (title + abstract) relevant to "${topic}". Using ONLY these sources, identify up to 5 genuine EVIDENCE GAPS in current clinical guidelines: areas where recommendations rest on weak/low-quality evidence (e.g. Level of Evidence C or expert opinion), are conflicting, or where the abstract itself notes limited evidence or a need for further research. Each gap MUST come from one listed source — do NOT invent gaps or sources. Return ONLY JSON: {"gaps":[{"gap":"the specific evidence gap / open question","why":"why the evidence is weak or missing, based on what the abstract says","sourceIndex":1}]}. If the abstracts show no clear gap, return {"gaps":[]}.\n\nSOURCES:\n${list}`;

  try {
    const res = await fetch(CEREBRAS_URL, {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: CEREBRAS_MODEL,
        temperature: 0.3,
        max_tokens: 4000,
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Give the evidence gaps for "${topic}" as JSON.` },
        ],
      }),
    });
    diag?.push(`glm http=${res.status}`);
    if (!res.ok) {
      diag?.push(`glm err: ${(await res.text().catch(() => "")).slice(0, 160)}`);
      return [];
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = (data.choices?.[0]?.message?.content ?? "")
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .trim();
    diag?.push(`raw len=${raw.length} head=${raw.slice(0, 140)}`);
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) return [];
    const parsed = JSON.parse(raw.slice(start, end + 1)) as {
      gaps?: Array<{ gap?: string; why?: string; sourceIndex?: number }>;
    };
    diag?.push(`parsedGaps=${(parsed.gaps ?? []).length}`);
    return (parsed.gaps ?? [])
      .slice(0, 5)
      .map((g) => {
        const src = sources[(g.sourceIndex ?? 1) - 1] ?? sources[0];
        return {
          gap: (g.gap ?? "").toString().slice(0, 500),
          why: (g.why ?? "").toString().slice(0, 500),
          citation: { title: (src.title ?? "").slice(0, 300), url: epmcUrl(src), year: src.pubYear },
        };
      })
      .filter((g) => g.gap);
  } catch (e) {
    diag?.push("exc: " + (e instanceof Error ? e.message : "?"));
    return [];
  }
}
