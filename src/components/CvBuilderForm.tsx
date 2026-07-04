"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  Upload,
  FileText,
  Download,
  RotateCcw,
  ShieldCheck,
  Check,
} from "lucide-react";
import { CV_STYLES, DEFAULT_STYLE, type CvStyleId } from "@/lib/cv/styles";
import { CvStyleThumb } from "./CvStyleThumb";

type ErrorPayload = { message?: string; error?: string };

export function CvBuilderForm() {
  const t = useTranslations("cvBuilder");
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [style, setStyle] = useState<CvStyleId>(DEFAULT_STYLE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState("professional-cv.pdf");

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  function pickFile(f: File | null) {
    setError(null);
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".docx")) {
      setError(t("badFile"));
      return;
    }
    setFile(f);
  }

  function clearPdf() {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  }

  function reset() {
    clearPdf();
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || loading) return;
    setLoading(true);
    setError(null);
    clearPdf();
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("style", style);
      const res = await fetch("/api/cv/generate", { method: "POST", body });

      const ct = res.headers.get("content-type") || "";
      if (res.ok && ct.includes("application/pdf")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const slug = file.name.replace(/\.docx$/i, "") || "professional";
        setPdfName(`${slug}-cv.pdf`);
        setPdfUrl(url);
      } else {
        const data = (await res.json().catch(() => ({}))) as ErrorPayload;
        setError(data.message || data.error || t("genericError"));
      }
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  }

  // ---- Result view ----
  if (pdfUrl) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight">{t("previewTitle")}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={pdfUrl}
              download={pdfName}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-700)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-brand-800)]"
            >
              <Download className="h-4 w-4" />
              {t("download")}
            </a>
            <button
              onClick={clearPdf}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-foreground)] transition hover:border-[var(--color-brand-600)] hover:text-[var(--color-brand-700)]"
            >
              <Sparkles className="h-4 w-4" />
              {t("tryAnother")}
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2.5 text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]"
            >
              <RotateCcw className="h-4 w-4" />
              {t("startOver")}
            </button>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-subtle)]/40">
          <iframe src={pdfUrl} title={t("previewTitle")} className="h-[75vh] w-full" />
        </div>
      </div>
    );
  }

  // ---- Upload view ----
  return (
    <div className="space-y-6">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 md:p-8"
      >
        {/* Style picker */}
        <div className="mb-6">
          <span className="text-sm font-medium">{t("styleLabel")}</span>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {CV_STYLES.map((s) => {
              const selected = s.id === style;
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  aria-pressed={selected}
                  className={`group relative rounded-xl border p-2 text-start transition ${
                    selected
                      ? "border-[var(--color-brand-600)] ring-2 ring-[var(--color-brand-200)]"
                      : "border-[var(--color-border)] hover:border-[var(--color-brand-400)]"
                  }`}
                >
                  {selected && (
                    <span className="absolute end-1.5 top-1.5 z-10 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-brand-700)] text-white">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                  <CvStyleThumb p={s.preview} />
                  <div className="mt-1.5 text-center text-xs font-medium text-[var(--color-foreground)]/80">
                    {t(`style.${s.nameKey}`)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload dropzone */}
        <label
          htmlFor="cv-file"
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-border)] px-6 py-8 text-center transition hover:border-[var(--color-brand-600)] hover:bg-[var(--color-subtle)]/40"
        >
          {file ? (
            <>
              <FileText className="h-8 w-8 text-[var(--color-brand-700)]" />
              <span className="mt-3 text-sm font-medium text-[var(--color-foreground)]">
                {file.name}
              </span>
              <span className="mt-1 text-xs text-[var(--color-brand-700)]">{t("changeFile")}</span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-[var(--color-muted)]" />
              <span className="mt-3 text-sm font-medium text-[var(--color-foreground)]">
                {t("chooseFile")}
              </span>
              <span className="mt-1 text-xs text-[var(--color-muted)]">{t("uploadHint")}</span>
            </>
          )}
          <input
            ref={inputRef}
            id="cv-file"
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <button
          type="submit"
          disabled={!file || loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-brand-700)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-brand-800)] disabled:opacity-50 sm:w-auto"
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

        <p className="mt-4 flex items-start gap-2 text-xs text-[var(--color-muted)]">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-brand-700)]" />
          {t("privacyNote")}
        </p>
      </form>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
          <div>
            <div className="text-sm font-semibold text-red-900">{t("errorTitle")}</div>
            <div className="mt-1 text-sm text-red-800">{error}</div>
          </div>
        </div>
      )}
    </div>
  );
}
