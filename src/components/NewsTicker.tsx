"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Sparkles, GitBranch, AppWindow, PlayCircle } from "lucide-react";

type IconKey = "ai" | "github" | "apps" | "youtube";
const ICONS: Record<IconKey, typeof Sparkles> = {
  ai: Sparkles,
  github: GitBranch,
  apps: AppWindow,
  youtube: PlayCircle,
};

export type TickerItem = {
  iconKey: IconKey;
  text: string;
  href: string;
  external?: boolean;
};

const ROTATE_MS = 5000;

export function NewsTicker({ items }: { items: TickerItem[] }) {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (items.length < 2) return;
    const id = window.setInterval(() => {
      setFading(true);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setFading(false);
      }, 250);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;

  const item = items[index];
  const Icon = ICONS[item.iconKey];

  const inner = (
    <span
      className={`flex items-center gap-2 transition-opacity duration-200 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent-300)]" />
      <span className="truncate">{item.text}</span>
    </span>
  );

  return (
    <div
      dir="ltr"
      className="relative w-full bg-[var(--color-brand-900)] text-white"
      role="region"
      aria-label="Latest updates"
    >
      <div className="mx-auto flex h-9 w-full max-w-6xl items-center gap-2 px-4 text-xs sm:px-6">
        <span className="hidden shrink-0 rounded-full bg-[var(--color-accent-500)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#451a03] sm:inline-block">
          New
        </span>

        <div className="flex flex-1 items-center overflow-hidden">
          {item.external ? (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center hover:underline"
            >
              {inner}
            </a>
          ) : (
            <Link href={item.href} className="flex w-full items-center hover:underline">
              {inner}
            </Link>
          )}
        </div>

        {items.length > 1 && (
          <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setFading(true);
                  window.setTimeout(() => {
                    setIndex(i);
                    setFading(false);
                  }, 200);
                }}
                aria-label={`Show update ${i + 1}`}
                className={`h-1.5 w-1.5 rounded-full transition ${
                  i === index
                    ? "bg-white"
                    : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
