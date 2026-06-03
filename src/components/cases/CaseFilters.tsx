"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
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

export function CaseFilters() {
  const t = useTranslations("cases");
  const tSpec = useTranslations("researchIdeas.specialty");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  }

  const sel =
    "rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm focus:border-[var(--color-brand-600)] focus:outline-none";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-subtle)]/50 p-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
        <Filter className="h-3.5 w-3.5" />
        {t("filtersLabel")}
      </div>
      <select
        value={params.get("specialty") || ""}
        onChange={(e) => update("specialty", e.target.value)}
        className={sel}
      >
        <option value="">{t("allSpecialties")}</option>
        {SPECIALTIES.map((s) => <option key={s} value={s}>{tSpec(s)}</option>)}
      </select>
      <select
        value={params.get("caseType") || ""}
        onChange={(e) => update("caseType", e.target.value)}
        className={sel}
      >
        <option value="">{t("allCaseTypes")}</option>
        {CASE_TYPES.map((c) => <option key={c} value={c}>{t(`caseType.${c}`)}</option>)}
      </select>
      <select
        value={params.get("outcome") || ""}
        onChange={(e) => update("outcome", e.target.value)}
        className={sel}
      >
        <option value="">{t("allOutcomes")}</option>
        {CASE_OUTCOMES.map((o) => <option key={o} value={o}>{t(`outcome.${o}`)}</option>)}
      </select>
      <input
        type="text"
        placeholder={t("drugSearchPlaceholder")}
        defaultValue={params.get("drug") || ""}
        onKeyDown={(e) => {
          if (e.key === "Enter") update("drug", (e.target as HTMLInputElement).value);
        }}
        className={sel}
      />
    </div>
  );
}
