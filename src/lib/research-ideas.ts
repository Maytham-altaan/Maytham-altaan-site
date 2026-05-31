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
