"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2, AlertCircle, FileUp, ImagePlus } from "lucide-react";
import { CASE_TYPES, CASE_OUTCOMES } from "@/lib/cases/types";

const SPECIALTIES = [
  "internal-medicine", "cardiology", "endocrinology", "gastroenterology",
  "nephrology", "pulmonology", "hematology", "oncology", "neurology",
  "infectious-diseases", "rheumatology", "general-surgery", "orthopedic-surgery",
  "neurosurgery", "urology", "vascular-surgery", "pediatric-surgery",
  "plastic-surgery", "cardiothoracic-surgery", "pediatrics", "obgyn",
  "anesthesia", "critical-care", "ophthalmology", "ent", "dermatology",
  "psychiatry", "family-medicine", "emergency-medicine", "radiology",
  "pathology", "clinical-pharmacy", "medical-microbiology", "community-medicine",
];

export function SubmitCaseForm() {
  const t = useTranslations("cases");
  const tSpec = useTranslations("researchIdeas.specialty");
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [error, setError] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [showAuthor, setShowAuthor] = useState(true);
  const [anonymized, setAnonymized] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("show_author", String(showAuthor));
    fd.set("anonymized", String(anonymized));
    try {
      const res = await fetch("/api/cases/submit", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error || "unknown");
        return;
      }
      setStatus("ok");
      setSlug(data.slug || "");
    } catch {
      setStatus("error");
      setError("network");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border border-[var(--color-brand-200)] bg-[var(--color-brand-50)] p-6 md:p-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[var(--color-brand-700)]" />
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-brand-900)]">
              {t("submitSuccessTitle")}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-brand-800)]">
              {t("submitSuccessBody")}
            </p>
            {slug && (
              <p className="mt-2 text-xs text-[var(--color-brand-800)]/80">
                Reference: <code>{slug}</code>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const input =
    "mt-1.5 block w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm placeholder:text-[var(--color-muted)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]";

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 md:p-8"
      encType="multipart/form-data"
    >
      <fieldset className="space-y-5">
        <legend className="text-sm font-semibold uppercase tracking-wider text-[var(--color-brand-700)]">
          {t("sectionCore")}
        </legend>

        <label className="block">
          <span className="text-sm font-medium">{t("titleEnLabel")} *</span>
          <input name="title_en" required maxLength={200} className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("titleArLabel")}</span>
          <input name="title_ar" maxLength={200} className={input} dir="rtl" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("summaryEnLabel")} *</span>
          <textarea name="summary_en" required maxLength={500} rows={3} className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("summaryArLabel")}</span>
          <textarea name="summary_ar" maxLength={500} rows={3} className={input} dir="rtl" />
        </label>
      </fieldset>

      <fieldset className="mt-8 space-y-5">
        <legend className="text-sm font-semibold uppercase tracking-wider text-[var(--color-brand-700)]">
          {t("sectionFilters")}
        </legend>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">{t("specialtyLabel")} *</span>
            <select name="specialty" required defaultValue="clinical-pharmacy" className={input}>
              {SPECIALTIES.map((s) => <option key={s} value={s}>{tSpec(s)}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("caseTypeLabel")} *</span>
            <select name="case_type" required defaultValue="rare-presentation" className={input}>
              {CASE_TYPES.map((c) => <option key={c} value={c}>{t(`caseType.${c}`)}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("drugLabel")}</span>
            <input name="drug" placeholder={t("drugPlaceholder")} maxLength={200} className={input} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("outcomeLabel")}</span>
            <select name="outcome" defaultValue="" className={input}>
              <option value="">—</option>
              {CASE_OUTCOMES.map((o) => <option key={o} value={o}>{t(`outcome.${o}`)}</option>)}
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="mt-8 space-y-5">
        <legend className="text-sm font-semibold uppercase tracking-wider text-[var(--color-brand-700)]">
          {t("sectionPatient")}
        </legend>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">{t("patientAgeLabel")}</span>
            <input type="number" name="patient_age" min={0} max={120} className={input} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("patientSexLabel")}</span>
            <select name="patient_sex" defaultValue="unspecified" className={input}>
              <option value="unspecified">{t("sex.unspecified")}</option>
              <option value="M">{t("sex.M")}</option>
              <option value="F">{t("sex.F")}</option>
              <option value="other">{t("sex.other")}</option>
            </select>
          </label>
        </div>
        <p className="text-xs text-[var(--color-muted)]">{t("anonymizationNote")}</p>
      </fieldset>

      <fieldset className="mt-8 space-y-5">
        <legend className="text-sm font-semibold uppercase tracking-wider text-[var(--color-brand-700)]">
          {t("sectionClinical")}
        </legend>
        <label className="block">
          <span className="text-sm font-medium">{t("presentationLabel")} *</span>
          <textarea name="presentation" required rows={5} className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("investigationsLabel")}</span>
          <textarea name="investigations" rows={4} className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("diagnosisLabel")}</span>
          <textarea name="diagnosis" rows={3} className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("treatmentLabel")}</span>
          <textarea name="treatment" rows={4} className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("caseOutcomeLabel")}</span>
          <textarea name="case_outcome" rows={3} className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("learningPointsLabel")}</span>
          <textarea name="learning_points" rows={3} className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("referencesLabel")}</span>
          <textarea name="references_text" rows={3} className={input} placeholder={t("referencesPlaceholder")} />
        </label>
      </fieldset>

      <fieldset className="mt-8 space-y-3">
        <legend className="text-sm font-semibold uppercase tracking-wider text-[var(--color-brand-700)]">
          {t("sectionMedia")}
        </legend>
        <p className="text-sm text-[var(--color-foreground)]/85">{t("imageExplain")}</p>
        <label className="flex items-center gap-3 text-sm">
          <ImagePlus className="h-5 w-5 text-[var(--color-brand-700)]" />
          <input
            type="file"
            name="image"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-brand-700)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
          />
        </label>
        <p className="text-xs italic text-[var(--color-muted)]">{t("imageHint")}</p>
      </fieldset>

      <fieldset className="mt-8 space-y-5">
        <legend className="text-sm font-semibold uppercase tracking-wider text-[var(--color-brand-700)]">
          {t("sectionSubmitter")}
        </legend>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">{t("submitterNameLabel")} *</span>
            <input name="submitter_name" required maxLength={120} className={input} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("submitterEmailLabel")} *</span>
            <input type="email" name="submitter_email" required maxLength={200} className={input} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("submitterAffiliationLabel")}</span>
            <input name="submitter_affiliation" maxLength={200} className={input} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("orcidLabel")}</span>
            <input name="submitter_orcid" maxLength={60} placeholder={t("orcidPlaceholder")} className={input} dir="ltr" />
          </label>
        </div>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={showAuthor}
            onChange={(e) => setShowAuthor(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)]"
          />
          <span>
            <span className="font-medium">{t("showAuthorLabel")}</span>
            <span className="block text-xs text-[var(--color-muted)]">
              {t("showAuthorHint")}
            </span>
          </span>
        </label>
      </fieldset>

      <fieldset className="mt-8 space-y-4 rounded-xl border border-dashed border-[var(--color-accent-300)] bg-[var(--color-accent-50)]/50 p-5">
        <legend className="px-2 text-sm font-semibold uppercase tracking-wider text-[var(--color-accent-700)]">
          {t("sectionConsent")}
        </legend>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={anonymized}
            onChange={(e) => setAnonymized(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)]"
          />
          <span>
            <span className="font-medium">{t("anonymizedLabel")} *</span>
            <span className="block text-xs text-[var(--color-muted)]">
              {t("anonymizedHint")}
            </span>
          </span>
        </label>

        <p className="text-sm text-[var(--color-foreground)]/85">{t("consentExplain")}</p>
        <label className="flex items-center gap-3 text-sm">
          <FileUp className="h-5 w-5 text-[var(--color-accent-700)]" />
          <input
            type="file"
            name="consent"
            accept="application/pdf"
            className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-brand-700)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
          />
        </label>
        <p className="text-xs italic text-[var(--color-muted)]">{t("consentTemplateHint")}</p>
      </fieldset>

      {status === "error" && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
          <div className="text-sm text-red-800">
            {t("submitError")} {error && <code className="ml-1">({error})</code>}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting" || !anonymized}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-700)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-brand-800)] disabled:opacity-60"
      >
        {status === "submitting" ? (
          <><Loader2 className="h-4 w-4 animate-spin" />{t("submitting")}</>
        ) : (
          t("submitButton")
        )}
      </button>
    </form>
  );
}
