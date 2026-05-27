import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "./Container";
import { SocialLinks } from "./SocialLinks";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tMeta = useTranslations("meta");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-[var(--color-border)] bg-[var(--color-subtle)]/40">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="text-lg font-semibold tracking-tight">
              {tMeta("siteName")}
            </div>
            <p className="mt-3 max-w-sm text-sm text-[var(--color-muted)]">
              {t("tagline")}
            </p>
            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                {t("followHeading")}
              </div>
              <div className="mt-3">
                <SocialLinks variant="muted" />
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold">{t("navHeading")}</div>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
              <li>
                <Link href="/" className="hover:text-[var(--color-brand-700)]">
                  {tNav("home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-[var(--color-brand-700)]"
                >
                  {tNav("about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/work"
                  className="hover:text-[var(--color-brand-700)]"
                >
                  {tNav("work")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold">{t("servicesHeading")}</div>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
              <li>
                <Link
                  href="/courses"
                  className="hover:text-[var(--color-brand-700)]"
                >
                  {tNav("courses")}
                </Link>
              </li>
              <li>
                <Link
                  href="/ai-detector"
                  className="hover:text-[var(--color-brand-700)]"
                >
                  {tNav("aiDetector")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-[var(--color-brand-700)]"
                >
                  {tNav("services")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[var(--color-brand-700)]"
                >
                  {tNav("contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-muted)]">
          © {year} {tMeta("siteName")}. {t("rights")}
        </div>
      </Container>
    </footer>
  );
}
