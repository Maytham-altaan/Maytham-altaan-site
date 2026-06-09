"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Heart, Share2, Link as LinkIcon, Check, Loader2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function CaseActions({
  caseId,
  title,
  initialCount,
  initiallyLiked,
}: {
  caseId: string;
  title: string;
  initialCount: number;
  initiallyLiked: boolean;
}) {
  const t = useTranslations("cases");
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initiallyLiked);
  const [busy, setBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function toggleLike() {
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
      if (liked) {
        setLiked(false);
        setCount((c) => Math.max(0, c - 1));
        await supa
          .from("case_likes")
          .delete()
          .eq("case_id", caseId)
          .eq("user_id", user.id);
      } else {
        setLiked(true);
        setCount((c) => c + 1);
        await supa
          .from("case_likes")
          .insert({ case_id: caseId, user_id: user.id });
      }
    } finally {
      setBusy(false);
    }
  }

  function shareUrl() {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  async function onShareClick() {
    const url = shareUrl();
    // Prefer the native share sheet on mobile / supported browsers.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled — fall through to menu */
      }
    }
    setShareOpen((v) => !v);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  const enc = (s: string) => encodeURIComponent(s);
  const url = shareUrl();
  const socials = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${enc(title + " — " + url)}`,
      svg: (
        <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.9 9.9 0 0 0 4.74 1.2c5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.4 1.3-1.93 1.34-.5.05-1.13.07-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.77-.36l.56.01c.18 0 .42-.07.66.5.24.59.82 2.03.89 2.18.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.16-.3.37-.42.49-.14.14-.29.29-.12.57.17.29.74 1.22 1.59 1.98 1.1.98 2.02 1.28 2.31 1.43.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.39-.24.66-.14.27.09 1.7.8 1.99.95.29.14.48.21.55.33.07.12.07.71-.17 1.39Z" />
      ),
    },
    {
      key: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`,
      svg: (
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
      ),
    },
    {
      key: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      svg: (
        <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.95.93-1.95 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
      ),
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
      svg: (
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0Z" />
      ),
    },
  ];

  const btn =
    "inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--color-subtle)]";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggleLike}
        aria-pressed={liked}
        className={`${btn} ${liked ? "border-red-200 bg-red-50 text-red-600" : ""}`}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
        )}
        <span>{t("likeLabel")}</span>
        <span className="tabular-nums text-[var(--color-muted)]">{count}</span>
      </button>

      <div className="relative" ref={menuRef}>
        <button type="button" onClick={onShareClick} className={btn}>
          <Share2 className="h-4 w-4" />
          <span>{t("shareLabel")}</span>
        </button>

        {shareOpen && (
          <div className="absolute z-20 mt-2 w-52 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-1 shadow-lg ltr:left-0 rtl:right-0">
            <button
              type="button"
              onClick={copyLink}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-[var(--color-subtle)]"
            >
              {copied ? (
                <Check className="h-4 w-4 text-[var(--color-brand-700)]" />
              ) : (
                <LinkIcon className="h-4 w-4" />
              )}
              {copied ? t("copied") : t("copyLink")}
            </button>
            {socials.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShareOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-[var(--color-subtle)]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                  {s.svg}
                </svg>
                {s.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
