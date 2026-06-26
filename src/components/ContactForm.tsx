"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, AlertCircle } from "lucide-react";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (data: FormData) => {
    const next: Record<string, string> = {};
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name) next.name = t("validationRequired");
    if (!email) next.email = t("validationRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = t("validationEmail");
    if (!message) next.message = t("validationRequired");
    return next;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const nextErrors = validate(data);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") || ""),
          email: String(data.get("email") || ""),
          subject: String(data.get("subject") || ""),
          message: String(data.get("message") || ""),
        }),
      });
      const json = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !json.ok) {
        setStatus("error");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-start gap-4 rounded-2xl border border-[var(--color-brand-200)] bg-[var(--color-brand-50)] p-6">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[var(--color-brand-700)]" />
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-brand-900)]">
            {t("successTitle")}
          </h3>
          <p className="mt-1 text-sm text-[var(--color-brand-800)]">
            {t("successBody")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {status === "error" && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
          <div>
            <div className="text-sm font-semibold text-red-900">
              {t("errorTitle")}
            </div>
            <div className="text-sm text-red-800">{t("errorBody")}</div>
          </div>
        </div>
      )}

      <Field
        name="name"
        label={t("nameLabel")}
        placeholder={t("namePlaceholder")}
        error={errors.name}
      />
      <Field
        name="email"
        type="email"
        label={t("emailLabel")}
        placeholder={t("emailPlaceholder")}
        error={errors.email}
      />
      <Field
        name="subject"
        label={t("subjectLabel")}
        placeholder={t("subjectPlaceholder")}
        error={errors.subject}
      />
      <Field
        name="message"
        as="textarea"
        label={t("messageLabel")}
        placeholder={t("messagePlaceholder")}
        error={errors.message}
      />

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-brand-700)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--color-brand-800)] disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? t("submittingLabel") : t("submitLabel")}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  placeholder,
  type = "text",
  as = "input",
  error,
}: {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  as?: "input" | "textarea";
  error?: string;
}) {
  const baseClasses =
    "mt-1.5 block w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]";
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--color-foreground)]">
        {label}
      </span>
      {as === "textarea" ? (
        <textarea
          name={name}
          placeholder={placeholder}
          rows={6}
          className={baseClasses}
        />
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
      {error && (
        <span className="mt-1.5 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
}
