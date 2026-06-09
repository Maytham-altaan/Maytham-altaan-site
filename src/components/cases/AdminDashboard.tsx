"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Check, X, FileText } from "lucide-react";
import type { CaseRow } from "@/lib/cases/types";

export function AdminDashboard({ pending }: { pending: CaseRow[] }) {
  const t = useTranslations("cases");
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function review(id: string, action: "approve" | "reject", notes = "") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/cases/${id}/review`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, notes }),
      });
      if (res.ok) router.refresh();
      else alert("Review failed");
    } finally {
      setBusyId(null);
    }
  }

  if (pending.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-subtle)]/40 p-8 text-center text-[var(--color-muted)]">
        {t("adminNoPending")}
      </div>
    );
  }

  return (
    <ol className="space-y-5">
      {pending.map((c) => (
        <li
          key={c.id}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-700)]">
              {t("adminPendingBadge")} · {c.specialty} · {t(`caseType.${c.case_type}`)}
            </div>
            {c.consent_path ? (
              <a
                href={`/api/cases/admin/consent?path=${encodeURIComponent(c.consent_path)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-brand-700)] hover:underline"
              >
                <FileText className="h-3.5 w-3.5" />
                {t("adminConsentLink")}
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                <FileText className="h-3.5 w-3.5" />
                {t("adminNoConsent")}
              </span>
            )}
          </div>
          <h3 className="mt-3 text-lg font-semibold tracking-tight">{c.title_en}</h3>
          {c.title_ar && (
            <h4 dir="rtl" className="mt-1 text-base font-semibold text-[var(--color-foreground)]/90">
              {c.title_ar}
            </h4>
          )}
          <p className="mt-3 text-sm text-[var(--color-muted)]">{c.summary_en}</p>
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer text-[var(--color-brand-700)]">{t("adminViewDetails")}</summary>
            <div className="mt-3 space-y-3 rounded-xl bg-[var(--color-subtle)]/50 p-4">
              <Field title={t("presentationLabel")} body={c.presentation} />
              {c.investigations && <Field title={t("investigationsLabel")} body={c.investigations} />}
              {c.diagnosis && <Field title={t("diagnosisLabel")} body={c.diagnosis} />}
              {c.treatment && <Field title={t("treatmentLabel")} body={c.treatment} />}
              {c.case_outcome && <Field title={t("caseOutcomeLabel")} body={c.case_outcome} />}
              {c.learning_points && <Field title={t("learningPointsLabel")} body={c.learning_points} />}
              {c.references_text && <Field title={t("referencesLabel")} body={c.references_text} />}
              <div className="border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-muted)]">
                <div>{t("adminSubmittedBy", { name: c.submitter_name, email: c.submitter_email })}</div>
                {c.submitter_affiliation && <div>{c.submitter_affiliation}</div>}
                <div className="mt-1">{t("adminShowAuthor")}: {c.show_author ? "yes" : "no (anonymous)"}</div>
              </div>
            </div>
          </details>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => review(c.id, "approve")}
              disabled={busyId === c.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-700)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {busyId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {t("adminApprove")}
            </button>
            <button
              onClick={() => {
                const notes = prompt(t("adminRejectPrompt") || "Reason?");
                if (notes !== null) review(c.id, "reject", notes);
              }}
              disabled={busyId === c.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-medium text-[var(--color-foreground)]/85 disabled:opacity-60"
            >
              <X className="h-3.5 w-3.5" />
              {t("adminReject")}
            </button>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Field({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
        {title}
      </div>
      <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-foreground)]/90">{body}</p>
    </div>
  );
}
