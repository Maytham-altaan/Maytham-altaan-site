"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function AuthForm() {
  const t = useTranslations("cases");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const supa = getSupabaseBrowser();
      const { error: err } = await supa.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/cases`,
        },
      });
      if (err) {
        setStatus("error");
        setError(err.message);
        return;
      }
      setStatus("sent");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "unknown");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-[var(--color-brand-200)] bg-[var(--color-brand-50)] p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[var(--color-brand-700)]" />
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-brand-900)]">
              {t("authSentTitle")}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-brand-800)]">
              {t("authSentBody", { email })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">{t("authEmailLabel")}</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1.5 block w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
        />
      </label>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-700)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {status === "sending" ? (
          <><Loader2 className="h-4 w-4 animate-spin" />{t("authSending")}</>
        ) : (
          <><Mail className="h-4 w-4" />{t("authSendButton")}</>
        )}
      </button>
      <p className="text-xs text-[var(--color-muted)]">{t("authNote")}</p>
    </form>
  );
}
