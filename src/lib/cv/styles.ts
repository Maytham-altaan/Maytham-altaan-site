/**
 * CV design styles the user can pick from. Each style carries:
 *  - `brief`: a precise design direction injected into the AI prompt, so the AI
 *    designs the HTML/CSS in that style (reliable, user-controlled variety).
 *  - `preview`: colours/layout used to draw the little thumbnail in the picker.
 *
 * Pure data — safe to import from both client (picker) and server (generate).
 */

export type CvStyleId =
  | "modern"
  | "elegant"
  | "classic"
  | "minimal"
  | "bold"
  | "tech";

export type CvStylePreview = {
  layout: "sidebar" | "header" | "single";
  paper: string;
  ink: string;
  primary: string;
  accent: string;
  serif: boolean;
};

export type CvStyle = {
  id: CvStyleId;
  /** i18n key under `cvBuilder.style` */
  nameKey: string;
  brief: string;
  preview: CvStylePreview;
};

export const CV_STYLES: CvStyle[] = [
  {
    id: "modern",
    nameKey: "modern",
    brief:
      "Modern professional. A two-column layout with a solid colour sidebar (left, ~34% width) holding the photo, contact, skills and languages; the main column holds the summary, experience and education. Palette: deep teal (#0f766e) sidebar with white text on a near-white page (#ffffff), plus a warm amber accent (#f59e0b) for small highlights. Typography: a clean geometric sans such as 'Inter' or 'Poppins' (Google Fonts) with a robust sans-serif fallback. Crisp section headers with a thin coloured rule. Confident, contemporary and hireable.",
    preview: {
      layout: "sidebar",
      paper: "#ffffff",
      ink: "#1f2937",
      primary: "#0f766e",
      accent: "#f59e0b",
      serif: false,
    },
  },
  {
    id: "elegant",
    nameKey: "elegant",
    brief:
      "Elegant editorial. Refined and magazine-like. Warm off-white paper (#faf7f2), charcoal text (#2b2b2b) and a single sophisticated accent (deep burgundy #7c2d12 or muted gold #a16207). Typography: pair an elegant serif for the name and section titles (e.g. 'Fraunces' or 'Playfair Display' from Google Fonts) with a quiet sans for body text. Generous whitespace, delicate hairline rules, and letter-spaced small-caps section labels. Understated luxury — suited to senior, academic, or client-facing roles.",
    preview: {
      layout: "single",
      paper: "#faf7f2",
      ink: "#2b2b2b",
      primary: "#7c2d12",
      accent: "#a16207",
      serif: true,
    },
  },
  {
    id: "classic",
    nameKey: "classic",
    brief:
      "Classic conservative. A timeless single-column résumé for medicine, academia, law or government. Palette: navy (#1e3a5f) headings on white with black body text and minimal accent. Typography: a traditional serif throughout (e.g. 'Source Serif 4' or Georgia), or serif headings with a clean serif body. A centred name/title header, clear section dividers, no photo emphasis and no flashy colour blocks. Reads as authoritative and trustworthy.",
    preview: {
      layout: "single",
      paper: "#ffffff",
      ink: "#111827",
      primary: "#1e3a5f",
      accent: "#1e3a5f",
      serif: true,
    },
  },
  {
    id: "minimal",
    nameKey: "minimal",
    brief:
      "Minimal. Maximum whitespace, near-monochrome. Palette: near-black text (#111111) on white, one subtle grey (#6b7280) for secondary text, and no colour blocks — at most a single thin accent line. Typography: one clean sans (e.g. 'Inter' or Helvetica Neue) across a few weights. Left-aligned, generous margins, thin hairline rules between sections and lots of breathing room. Quiet, confident and design-forward through restraint.",
    preview: {
      layout: "single",
      paper: "#ffffff",
      ink: "#111111",
      primary: "#111111",
      accent: "#9ca3af",
      serif: false,
    },
  },
  {
    id: "bold",
    nameKey: "bold",
    brief:
      "Bold modern. Confident and eye-catching for creative, marketing, sales or startup roles. A strong full-width coloured header band across the top holds the name, title, photo and contact in white. Palette: a vivid primary (indigo #4338ca or emerald #059669) with a bright accent. Typography: a strong contemporary sans (e.g. 'Poppins' or 'Montserrat') with heavy weights for headings. Use coloured section labels or accent chips for skills. Punchy visual hierarchy while staying professional.",
    preview: {
      layout: "header",
      paper: "#ffffff",
      ink: "#1f2937",
      primary: "#4338ca",
      accent: "#f43f5e",
      serif: false,
    },
  },
  {
    id: "tech",
    nameKey: "tech",
    brief:
      "Tech / engineering. Clean and precise, tuned for developers, engineers and data roles. A two-column layout with a slim dark sidebar. Palette: near-black ink (#0f172a) with a single sharp accent (electric blue #2563eb or green #16a34a) on white. Typography: a modern sans for prose (e.g. 'Inter') paired with a monospaced accent (e.g. 'JetBrains Mono' or 'IBM Plex Mono' from Google Fonts) for section labels, the job title and skill tags — a subtle terminal/technical feel. Show skills as compact monospace tags. Structured, grid-like, no fluff.",
    preview: {
      layout: "sidebar",
      paper: "#ffffff",
      ink: "#0f172a",
      primary: "#0f172a",
      accent: "#2563eb",
      serif: false,
    },
  },
];

export const DEFAULT_STYLE: CvStyleId = "modern";

export function getStyle(id: string | null | undefined): CvStyle {
  return CV_STYLES.find((s) => s.id === id) ?? CV_STYLES[0];
}
