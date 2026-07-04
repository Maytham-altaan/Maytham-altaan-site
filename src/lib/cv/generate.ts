/**
 * AI CV builder — server logic.
 *
 * 1. parseDocx: pull clean text + the first embedded photo out of a .docx.
 *    The photo is injected straight into the final HTML and is NEVER sent to
 *    the LLM — only the text is. That keeps the AI's PII surface minimal.
 * 2. generateCvHtml: the AI (GLM 4.7 by Zhipu — a Chinese model — served free on
 *    Cerebras's fast, US-hosted, OpenAI-compatible endpoint) DESIGNS the CV: it
 *    returns a complete, self-contained, print-ready HTML/CSS document (its own
 *    colours, layout, and typography), rendered to a PDF by headless Chromium.
 *
 * NOTE ON PRIVACY: only the CV *text* is ever sent to the AI (never the photo);
 * inference runs on Cerebras (US). Set CEREBRAS_API_KEY in Vercel; the model is
 * overridable via CEREBRAS_MODEL (e.g. "gpt-oss-120b").
 */

import mammoth from "mammoth";
import { getStyle } from "./styles";

// Cerebras — free tier: 1M tokens/day, no credit card, very fast, OpenAI-compatible,
// US-hosted. Default model is Zhipu's GLM 4.7 (a strong Chinese model, free on
// Cerebras's public endpoint); override with CEREBRAS_MODEL (e.g. "gpt-oss-120b").
const CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions";
const CEREBRAS_MODEL = process.env.CEREBRAS_MODEL || "zai-glm-4.7";

/** Hard cap on the text we send to the model — keeps token cost tiny. */
const MAX_TEXT_CHARS = 20000;

/** Placeholder the AI must use for the photo; we swap in the real data URI. */
export const PHOTO_TOKEN = "__CV_PHOTO_URL__";

export type CvHtmlResult =
  | { ok: true; html: string }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// 1. .docx parsing
// ---------------------------------------------------------------------------

/**
 * Extract clean text and (best-effort) the first raster photo from a .docx.
 * Only png/jpeg are accepted as photos; anything else (emf/wmf/svg) is skipped
 * and the CV is designed without a photo.
 */
export async function parseDocx(
  buffer: Buffer
): Promise<{ text: string; photoDataUri: string | null }> {
  let photoDataUri: string | null = null;

  // Pass 1 — capture the first embedded png/jpeg (the CV photo), if any.
  try {
    await mammoth.convertToHtml(
      { buffer },
      {
        convertImage: mammoth.images.imgElement(async (image) => {
          if (!photoDataUri) {
            const ct = (image.contentType || "").toLowerCase();
            if (ct === "image/png" || ct === "image/jpeg" || ct === "image/jpg") {
              const b64 = await image.read("base64");
              const mime = ct === "image/jpg" ? "image/jpeg" : ct;
              photoDataUri = `data:${mime};base64,${b64}`;
            }
          }
          return { src: "" }; // HTML is discarded; we only want the buffer.
        }),
      }
    );
  } catch {
    // Photo extraction is best-effort — never fail the whole request over it.
  }

  // Pass 2 — clean raw text.
  const { value } = await mammoth.extractRawText({ buffer });
  const text = value.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  return { text, photoDataUri };
}

// ---------------------------------------------------------------------------
// 2. Groq — design the CV as HTML/CSS
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are an elite CV/résumé designer AND a professional resume writer. You receive the raw, unpolished text a person exported from their own simple CV (any language, poorly formatted, possibly incomplete). You produce a single, beautifully DESIGNED, print-ready résumé as a complete HTML document.

WRITING (content):
- Translate everything into clear, professional ENGLISH if it isn't already.
- Use ONLY facts present in the source. NEVER invent employers, titles, dates, degrees, certifications, contact details, or numbers. Omit anything not provided.
- Rewrite duties into concise, achievement-oriented bullet points that begin with strong action verbs. Write a compelling 2–3 sentence professional summary. Infer a suitable professional job-title/headline if the source doesn't state one.

DESIGN (this is the point — make it look like real graphic design, not a plain document):
- Return ONE complete, self-contained HTML document: <!doctype html> … </html>. ALL CSS inside a single <style> tag. NO JavaScript. NO external images or files.
- Design for A4 print: include @page { size: A4; margin: 0 } and lay the résumé out on a 210mm-wide canvas with its own internal padding (~14–18mm). Content longer than one page must flow cleanly onto additional A4 pages — never rely on a fixed pixel height that clips content.
- STYLE DIRECTION — you MUST follow this precisely (it defines the palette, typography and layout): %%STYLE_DIRECTION%%
- Realise that style with a strong visual hierarchy, a cohesive colour palette, clear section headers, and confident use of whitespace.
- Typography: you MAY include ONE Google Fonts <link> for an elegant, professional pairing (e.g. a refined sans or serif), and ALWAYS include a robust system-font fallback stack so it still looks great if the font can't load. Set colours with print in mind (backgrounds must render — they will, printBackground is on).
- Use CSS (borders, background bands, simple inline SVG icons or unicode marks) for visual interest. Do NOT use generic AI-slop aesthetics (no plain Inter-on-white with a purple gradient). Give it a distinctive, hireable, professional character appropriate to the person's field.
- Keep it ATS-reasonable: real selectable text (never text baked into images), sensible reading order.

PHOTO:
%%PHOTO_INSTRUCTION%%

OUTPUT RULES:
- Output ONLY the raw HTML document. No markdown, no code fences, no explanation before or after.`;

function systemPrompt(hasPhoto: boolean, styleBrief: string): string {
  const photoInstruction = hasPhoto
    ? `A professional photo IS available. Design a place for it (e.g. in the sidebar/header) and reference it EXACTLY as: <img src="${PHOTO_TOKEN}" alt="Profile photo" style="…your styling…">. Style it tastefully (e.g. a circular or rounded frame). Use the token ${PHOTO_TOKEN} verbatim as the src — it will be replaced with the real image.`
    : `NO photo is available. Do NOT include any <img> tag or photo placeholder; design a clean layout that doesn't need one.`;
  return SYSTEM_PROMPT.replace("%%STYLE_DIRECTION%%", styleBrief).replace(
    "%%PHOTO_INSTRUCTION%%",
    photoInstruction
  );
}

export async function generateCvHtml(
  rawText: string,
  opts: { hasPhoto: boolean; styleId?: string }
): Promise<CvHtmlResult> {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error:
        "CEREBRAS_API_KEY is not configured. Add your free Cerebras API key in Vercel Project Settings → Environment Variables.",
    };
  }

  const text = rawText.slice(0, MAX_TEXT_CHARS);

  try {
    const res = await fetch(CEREBRAS_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: CEREBRAS_MODEL,
        temperature: 0.6,
        // Generous headroom so any model reasoning + the full HTML both fit.
        // Cerebras free allows 60K tokens/min and 1M/day — no tight per-minute cap.
        max_tokens: 10000,
        messages: [
          {
            role: "system",
            content: systemPrompt(opts.hasPhoto, getStyle(opts.styleId).brief),
          },
          {
            role: "user",
            content: `Here is the raw CV text. Design and write the professional HTML résumé described above.\n\n---\n${text}\n---`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Cerebras API error ${res.status}: ${detail.slice(0, 200)}`,
      };
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const html = sanitizeHtml(data.choices?.[0]?.message?.content ?? "");

    if (!html || html.length < 200 || !/<\/html>/i.test(html)) {
      return { ok: false, error: "The AI returned an incomplete design. Please retry." };
    }
    return { ok: true, html };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error calling the AI.",
    };
  }
}

/**
 * Trim any stray markdown fences / prose the model may add around the document,
 * and strip <script> tags for safety (the HTML is rendered in headless Chrome
 * and previewed in the browser).
 */
function sanitizeHtml(raw: string): string {
  let html = raw.trim();

  // Reasoning models (GLM, gpt-oss) can emit <think>…</think> blocks — drop them.
  html = html.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Remove a leading ```html / ``` fence and trailing ```.
  html = html.replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "").trim();

  // Keep only the actual document if the model wrapped it in prose.
  const start = html.search(/<!doctype html>|<html[\s>]/i);
  if (start > 0) html = html.slice(start);
  const end = html.toLowerCase().lastIndexOf("</html>");
  if (end !== -1) html = html.slice(0, end + "</html>".length);

  // Defense-in-depth: drop any scripts and inline event handlers.
  html = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "");

  return html.trim();
}

/** Swap the photo placeholder for the real image, or strip it if none. */
export function injectPhoto(html: string, photoDataUri: string | null): string {
  if (photoDataUri) return html.split(PHOTO_TOKEN).join(photoDataUri);
  // No photo but token slipped in — remove any <img> that references it.
  return html.replace(
    new RegExp(`<img\\b[^>]*${PHOTO_TOKEN}[^>]*>`, "gi"),
    ""
  );
}

// ---------------------------------------------------------------------------
// Rate limit — best-effort in-memory (mirrors lib/research-ideas.ts).
// ---------------------------------------------------------------------------

const HITS = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;

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
