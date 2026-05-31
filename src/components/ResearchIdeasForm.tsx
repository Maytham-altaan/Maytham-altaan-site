"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  Loader2,
  Search,
  AlertCircle,
  Stethoscope,
} from "lucide-react";

type Idea = {
  titleEn: string;
  titleAr: string;
  background: string;
  researchQuestion: string;
  methodology: string;
  novelty: string;
  difficulty: number;
  emerging?: boolean;
};

type Result = {
  ok: boolean;
  ideas: Idea[];
  groundingCount: number;
  error?: string;
  message?: string;
  remaining?: number;
};

const SPECIALTIES = [
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
];

const STUDY_DESIGNS = [
  "any",
  "rct",
  "cohort",
  "case-control",
  "cross-sectional",
  "case-series",
  "systematic-review",
  "qualitative",
];

export function ResearchIdeasForm({ locale }: { locale: string }) {
  const t = useTranslations("researchIdeas");
  const [specialty, setSpecialty] = useState("clinical-pharmacy");
  const [subspecialty, setSubspecialty] = useState("");
  const [studyDesign, setStudyDesign] = useState("any");
  const [constraints, setConstraints] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/research-ideas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          specialty,
          subspecialty,
          studyDesign,
          constraints,
          locale,
        }),
      });
      const data = (await res.json()) as Result;
      setResult(data);
    } catch {
      setResult({
        ok: false,
        ideas: [],
        groundingCount: 0,
        error: "network",
        message: t("networkError"),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 md:p-8"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">{t("specialtyLabel")}</span>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
            >
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {t(`specialty.${s}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">{t("studyDesignLabel")}</span>
            <select
              value={studyDesign}
              onChange={(e) => setStudyDesign(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
            >
              {STUDY_DESIGNS.map((d) => (
                <option key={d} value={d}>
                  {t(`design.${d}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium">
              {t("subspecialtyLabel")}{" "}
              <span className="font-normal text-[var(--color-muted)]">
                ({t("optional")})
              </span>
            </span>
            <input
              type="text"
              value={subspecialty}
              onChange={(e) => setSubspecialty(e.target.value)}
              placeholder={t("subspecialtyPlaceholder")}
              maxLength={200}
              className="mt-1.5 block w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm placeholder:text-[var(--color-muted)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium">
              {t("constraintsLabel")}{" "}
              <span className="font-normal text-[var(--color-muted)]">
                ({t("optional")})
              </span>
            </span>
            <textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder={t("constraintsPlaceholder")}
              maxLength={500}
              rows={3}
              className="mt-1.5 block w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm placeholder:text-[var(--color-muted)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-700)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-brand-800)] disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("generating")}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {t("generate")}
            </>
          )}
        </button>

        <p className="mt-3 text-xs text-[var(--color-muted)]">
          {t("rateLimitNote")}
        </p>
      </form>

      {result && !result.ok && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
          <div>
            <div className="text-sm font-semibold text-red-900">
              {t("errorTitle")}
            </div>
            <div className="mt-1 text-sm text-red-800">
              {result.message || result.error || t("genericError")}
            </div>
          </div>
        </div>
      )}

      {result && result.ok && result.ideas.length > 0 && (
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--color-muted)]">
            <div className="inline-flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5" />
              {t("groundedNote", { count: result.groundingCount })}
            </div>
            {typeof result.remaining === "number" && (
              <div>{t("remainingHint", { n: result.remaining })}</div>
            )}
          </div>

          <ol className="space-y-5">
            {result.ideas.map((idea, i) => (
              <li
                key={i}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 md:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-700)]">
                      {t("ideaLabel", { n: i + 1 })}
                    </div>
                    {idea.emerging && (
                      <span
                        title={t("emergingTooltip")}
                        className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-100)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent-700)]"
                      >
                        ✨ {t("emergingBadge")}
                      </span>
                    )}
                  </div>
                  <DifficultyBadge level={idea.difficulty} t={t} />
                </div>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">
                  {idea.titleEn}
                </h3>
                <h4
                  dir="rtl"
                  className="mt-1 text-lg font-semibold tracking-tight text-[var(--color-foreground)]/90"
                >
                  {idea.titleAr}
                </h4>

                <Section title={t("background")} body={idea.background} />
                <Section
                  title={t("researchQuestion")}
                  body={idea.researchQuestion}
                />
                <Section title={t("methodology")} body={idea.methodology} />
                <Section title={t("novelty")} body={idea.novelty} />

                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(idea.titleEn)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-brand-700)] hover:text-[var(--color-brand-800)]"
                >
                  <Search className="h-3.5 w-3.5" />
                  {t("searchLiterature")}
                </a>
              </li>
            ))}
          </ol>

          <p className="mt-8 text-xs italic text-[var(--color-muted)]">
            {t("disclaimer")}
          </p>
        </div>
      )}
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
        {title}
      </div>
      <p className="mt-1 text-sm text-[var(--color-foreground)]/85">{body}</p>
    </div>
  );
}

function DifficultyBadge({
  level,
  t,
}: {
  level: number;
  t: ReturnType<typeof useTranslations>;
}) {
  const clamped = Math.max(1, Math.min(5, level));
  return (
    <span
      title={t("difficultyTooltip")}
      className="inline-flex items-center gap-1 rounded-full bg-[var(--color-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-foreground)]/80"
    >
      {t("difficulty")}: {"●".repeat(clamped) + "○".repeat(5 - clamped)}
    </span>
  );
}
