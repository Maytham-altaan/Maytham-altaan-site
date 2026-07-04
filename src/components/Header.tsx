"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Container } from "./Container";

const NAV_LINKS = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/courses", key: "courses" },
  { href: "/ai-detector", key: "aiDetector" },
  { href: "/work", key: "work" },
  { href: "/services", key: "services" },
  { href: "/numbers", key: "numbers" },
  { href: "/research-ideas", key: "research" },
  { href: "/cv-builder", key: "cv" },
  { href: "/cases", key: "cases" },
  { href: "/contact", key: "contact" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const tMeta = useTranslations("meta");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-background)]/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-[var(--color-foreground)] hover:text-[var(--color-brand-700)]"
          onClick={() => setOpen(false)}
        >
          {tMeta("siteName")}
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                isActive(link.href)
                  ? "bg-[var(--color-subtle)] text-[var(--color-brand-700)]"
                  : "text-[var(--color-foreground)]/80 hover:bg-[var(--color-subtle)] hover:text-[var(--color-brand-700)]"
              }`}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] p-2 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t("close") : t("menu")}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {open && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-background)] lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-base transition ${
                  isActive(link.href)
                    ? "bg-[var(--color-subtle)] text-[var(--color-brand-700)] font-medium"
                    : "text-[var(--color-foreground)]/80 hover:bg-[var(--color-subtle)]"
                }`}
              >
                {t(link.key)}
              </Link>
            ))}
          </Container>
        </div>
      )}
    </header>
  );
}
