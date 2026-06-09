"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Star, Loader2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function CaseRating({
  caseId,
  initialAvg,
  initialCount,
  initialMyRating,
}: {
  caseId: string;
  initialAvg: number;
  initialCount: number;
  initialMyRating: number | null;
}) {
  const t = useTranslations("cases");
  const router = useRouter();
  const [avg, setAvg] = useState(initialAvg);
  const [count, setCount] = useState(initialCount);
  const [myRating, setMyRating] = useState<number | null>(initialMyRating);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);

  async function rate(n: number) {
    if (busy) return;
    setBusy(true);
    try {
      const supa = getSupabaseBrowser();
      const { data: userResp } = await supa.auth.getUser();
      const user = userResp.user;
      if (!user) {
        router.push("/cases/auth");
        return;
      }
      // Optimistic average recompute.
      const prev = myRating;
      const newCount = prev == null ? count + 1 : count;
      const newAvg =
        prev == null
          ? (avg * count + n) / newCount
          : (avg * count - prev + n) / count;
      setMyRating(n);
      setCount(newCount);
      setAvg(newAvg);

      const { error } = await supa.from("case_ratings").upsert(
        {
          case_id: caseId,
          user_id: user.id,
          rating: n,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "case_id,user_id" }
      );
      if (error) {
        // Roll back on failure.
        setMyRating(prev);
        setCount(count);
        setAvg(avg);
      }
    } finally {
      setBusy(false);
    }
  }

  const display = hover || myRating || 0;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <div className="flex items-center gap-1">
        <span className="me-1 text-sm font-medium text-[var(--color-foreground)]/80">
          {t("rateThisCase")}
        </span>
        <div className="flex items-center" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={busy}
              onMouseEnter={() => setHover(n)}
              onClick={() => rate(n)}
              aria-label={`${n} / 5`}
              className="p-0.5 transition disabled:opacity-60"
            >
              <Star
                className={`h-5 w-5 ${
                  n <= display
                    ? "fill-amber-400 text-amber-400"
                    : "text-[var(--color-border)]"
                }`}
              />
            </button>
          ))}
        </div>
        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-muted)]" />}
      </div>

      <div className="text-sm text-[var(--color-muted)]">
        {count > 0 ? (
          <>
            <span className="font-semibold text-[var(--color-foreground)]">
              {avg.toFixed(1)}
            </span>{" "}
            ★ · {t("ratingsCount", { count })}
            {myRating != null && (
              <span className="ms-1">· {t("yourRating", { rating: myRating })}</span>
            )}
          </>
        ) : (
          <span className="italic">{t("noRatingsYet")}</span>
        )}
      </div>
    </div>
  );
}
