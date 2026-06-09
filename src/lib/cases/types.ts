export type CaseStatus = "pending" | "approved" | "rejected";

export type CaseType =
  | "rare-presentation"
  | "drug-toxicity"
  | "complication"
  | "diagnostic-challenge"
  | "adverse-event"
  | "other";

export type CaseOutcome = "survived" | "deceased" | "ongoing" | "unknown";

export type PatientSex = "M" | "F" | "other" | "unspecified";

export type CaseRow = {
  id: string;
  slug: string;
  status: CaseStatus;
  title_en: string;
  title_ar: string | null;
  summary_en: string;
  summary_ar: string | null;
  specialty: string;
  case_type: CaseType;
  drug: string | null;
  outcome: CaseOutcome | null;
  patient_age: number | null;
  patient_sex: PatientSex | null;
  presentation: string;
  investigations: string | null;
  diagnosis: string | null;
  treatment: string | null;
  case_outcome: string | null;
  learning_points: string | null;
  references_text: string | null;
  image_path: string | null;
  consent_path: string | null;
  submitter_name: string;
  submitter_email: string;
  submitter_affiliation: string | null;
  submitter_orcid: string | null;
  doi: string | null;
  show_author: boolean;
  display_author: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  submitted_at: string;
  updated_at: string;
};

export type CommentRow = {
  id: string;
  case_id: string;
  author_id: string;
  author_name: string;
  body: string;
  is_hidden: boolean;
  created_at: string;
};

export const CASE_TYPES: CaseType[] = [
  "rare-presentation",
  "drug-toxicity",
  "complication",
  "diagnostic-challenge",
  "adverse-event",
  "other",
];

export const CASE_OUTCOMES: CaseOutcome[] = [
  "survived",
  "deceased",
  "ongoing",
  "unknown",
];

/** Public URL for a case photo stored in the 'case-images' bucket. */
export function caseImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/case-images/${path}`;
}

/** Slug from title — used for human-readable URLs. */
export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "case"
  );
}
