"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Loader2, MessageSquare, LogIn } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { CommentRow } from "@/lib/cases/types";

export function CommentsSection({
  caseId,
  initialComments,
}: {
  caseId: string;
  initialComments: CommentRow[];
}) {
  const t = useTranslations("cases");
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const supa = getSupabaseBrowser();
      const { data } = await supa.auth.getUser();
      if (alive) setSignedIn(!!data.user);
    })();
    return () => { alive = false; };
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/cases/${caseId}/comments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "unknown");
        return;
      }
      // Optimistic add — we don't have all the row data so re-fetch via Supabase
      const supa = getSupabaseBrowser();
      const { data: userResp } = await supa.auth.getUser();
      const u = userResp.user!;
      setComments((c) => [
        ...c,
        {
          id: data.id,
          case_id: caseId,
          author_id: u.id,
          author_name:
            (u.user_metadata?.full_name as string) || u.email || "Anonymous",
          body: text,
          is_hidden: false,
          created_at: new Date().toISOString(),
        },
      ]);
      setText("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-12 border-t border-[var(--color-border)] pt-10">
      <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <MessageSquare className="h-5 w-5" />
        {t("commentsTitle", { count: comments.length })}
      </h2>

      <ul className="mt-6 space-y-4">
        {comments.length === 0 && (
          <li className="text-sm italic text-[var(--color-muted)]">
            {t("noCommentsYet")}
          </li>
        )}
        {comments.map((c) => (
          <li
            key={c.id}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">{c.author_name}</span>
              <span
                dir="ltr"
                className="text-xs text-[var(--color-muted)] tabular-nums"
              >
                {new Date(c.created_at).toLocaleString()}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--color-foreground)]/90">
              {c.body}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {signedIn === null ? (
          <div className="text-sm text-[var(--color-muted)]">
            <Loader2 className="inline h-3.5 w-3.5 animate-spin" />
          </div>
        ) : signedIn ? (
          <form onSubmit={onSubmit} className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              maxLength={4000}
              placeholder={t("commentPlaceholder")}
              className="block w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
            />
            {error && (
              <div className="text-xs text-red-600">{t("commentError")} ({error})</div>
            )}
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-700)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {t("commentPost")}
            </button>
          </form>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-subtle)]/40 p-5 text-sm">
            <div className="text-[var(--color-muted)]">{t("commentSignInPrompt")}</div>
            <Link
              href="/cases/auth"
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-700)] px-4 py-2 text-xs font-medium text-white"
            >
              <LogIn className="h-3.5 w-3.5" />
              {t("commentSignInButton")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
