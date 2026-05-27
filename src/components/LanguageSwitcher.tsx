"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const target = locale === "en" ? "ar" : "en";
  const label = target === "ar" ? "العربية" : "English";

  const switchLocale = () => {
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- pathname/params accepted as-is by next-intl
        { pathname, params },
        { locale: target }
      );
    });
  };

  return (
    <button
      onClick={switchLocale}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1.5 text-sm font-medium text-[var(--color-foreground)] transition hover:border-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] disabled:opacity-50"
      aria-label={`Switch to ${label}`}
    >
      <Languages className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
