"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Loader2, Check, X, FileText, Eye, EyeOff, Trash2, Hash } from "lucide-react";
import type { CaseRow } from "@/lib/cases/types";

type Action = "approve" | "reject" | "unpublish" | "delete";

export function AdminDashboard({
  pending,
  published,
}: {
  pending: CaseRow[];
  published: CaseRow[];
}) {
  const t = useTranslations("cases");
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function review(id: string, action: Action, notes = "") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/cases/${id}/review`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, notes }),
      });
      if (res.ok) router.refresh();
      else alert("Action failed");
    } finally {
      setBusyId(null);
    }
  }

  async function setDoi(id: string, current: string | null) {
    const doi = prompt(t("adminSetDoiPrompt"), current || "");
    if (doi === null) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/cases/${id}/review`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "set_doi", doi }),
      });
      if (res.ok) router.refresh();
      else alert("Action failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-12">
      {/* Pending queue */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-700)]">
          {t("adminPendingHeading")}
        </h2>
        {pending.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-subtle)]/40 p-8 text-center text-[var(--color-muted)]">
            {t("adminNoPending")}
          </div>
        ) : (
          <ol className="mt-4 space-y-5">
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
        )}
      </div>

      {/* Published cases — manage / remove */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-700)]">
          {t("adminPublishedHeading")}
        </h2>
        {published.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-subtle)]/40 p-8 text-center text-[var(--color-muted)]">
            {t("adminNoPublished")}
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {published.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                    {c.specialty} · {t(`caseType.${c.case_type}`)}
                  </div>
                  <h3 className="truncate text-sm font-semibold">{c.title_en}</h3>
                  {c.doi && (
                    <div className="truncate text-[11px] text-[var(--color-muted)]" dir="ltr">
                      DOI: {c.doi}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Link
                    href={`/cases/${c.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-subtle)]"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {t("adminView")}
                  </Link>
                  <button
                    onClick={() => setDoi(c.id, c.doi)}
                    disabled={busyId === c.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-subtle)] disabled:opacity-60"
                  >
                    <Hash className="h-3.5 w-3.5" />
                    {c.doi ? t("adminEditDoi") : t("adminSetDoi")}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(t("adminUnpublishConfirm"))) review(c.id, "unpublish");
                    }}
                    disabled={busyId === c.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-foreground)]/85 disabled:opacity-60"
                  >
                    {busyId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {t("adminUnpublish")}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(t("adminDeleteConfirm"))) review(c.id, "delete");
                    }}
                    disabled={busyId === c.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("adminDelete")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
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
