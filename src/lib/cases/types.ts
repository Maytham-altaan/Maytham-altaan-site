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
  consent_path: string;
  submitter_name: string;
  submitter_email: string;
  submitter_affiliation: string | null;
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
