"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Users, Eye } from "lucide-react";
import { Container } from "@/components/Container";

const NAMESPACE = "maytham-altaan-com";
const KEY = "visits";
const SESSION_KEY = "altaan_visit_counted";
// Hide the bar until we have meaningful traffic — showing "5 visitors" on
// a personal site looks worse than not showing anything.
const MIN_VISIBLE = 50;

type CounterResponse = { value: number };

async function fetchHit(): Promise<number | null> {
  try {
    const res = await fetch(
      `https://abacus.jasoncameron.dev/hit/${NAMESPACE}/${KEY}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as CounterResponse;
    return data.value;
  } catch {
    return null;
  }
}

async function fetchGet(): Promise<number | null> {
  try {
    const res = await fetch(
      `https://abacus.jasoncameron.dev/get/${NAMESPACE}/${KEY}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as CounterResponse;
    return data.value;
  } catch {
    return null;
  }
}

export function VisitorsBar() {
  const t = useTranslations("visitors");
  const locale = useLocale();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const alreadyCounted =
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem(SESSION_KEY) === "1";

    (async () => {
      const value = alreadyCounted ? await fetchGet() : await fetchHit();
      if (!alive) return;
      if (value !== null) {
        setCount(value);
        if (!alreadyCounted) {
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            /* ignore */
          }
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Render nothing while loading, on fetch error, or below the minimum.
  if (count === null || count < MIN_VISIBLE) return null;

  const formatter = new Intl.NumberFormat(locale);
  const display = formatter.format(count);

  return (
    <section className="border-b border-[var(--color-border)] py-6">
      <Container>
    <div
      className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-subtle)]/60 px-5 py-3 text-sm text-[var(--color-foreground)]/85"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
          <Users className="h-4 w-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
            {t("totalLabel")}
          </span>
          <span
            dir="ltr"
            className="text-lg font-semibold tabular-nums text-[var(--color-foreground)]"
          >
            {display}
          </span>
        </div>
      </div>

      <div className="hidden h-8 w-px bg-[var(--color-border)] sm:block" />

      <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
        <Eye className="h-3.5 w-3.5" />
        <span>{t("note")}</span>
      </div>
    </div>
      </Container>
    </section>
  );
}
