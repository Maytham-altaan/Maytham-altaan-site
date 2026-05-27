import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/Container";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { Award, Heart, MessageCircle, Compass } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const credentials = [
    t("credential1"),
    t("credential2"),
    t("credential3"),
    t("credential4"),
    t("credential5"),
    t("credential6"),
  ];

  const values = [
    { icon: Heart, title: t("value1Title"), body: t("value1Body") },
    { icon: MessageCircle, title: t("value2Title"), body: t("value2Body") },
    { icon: Compass, title: t("value3Title"), body: t("value3Body") },
  ];

  return (
    <>
      <section className="border-b border-[var(--color-border)] py-16 md:py-24">
        <Container>
          <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-brand-700)]">
                {t("eyebrow")}
              </div>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                {t("title")}
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-[var(--color-muted)]">
                {t("subtitle")}
              </p>
            </div>
            <div className="justify-self-center md:justify-self-end">
              <div className="rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-brand-100)] via-[var(--color-background)] to-[var(--color-accent-100)] p-1.5 shadow-sm">
                <ProfilePhoto
                  size={240}
                  rounded="rounded-[1.4rem]"
                  className="h-56 w-56 md:h-60 md:w-60"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                {t("bioHeading")}
              </h2>
              <p className="mt-5 text-[var(--color-muted)] md:text-lg">
                {t("bioBody")}
              </p>

              <h2 className="mt-14 text-2xl font-semibold tracking-tight">
                {t("missionHeading")}
              </h2>
              <p className="mt-5 text-[var(--color-muted)] md:text-lg">
                {t("missionBody")}
              </p>
            </div>

            <aside>
              <div className="sticky top-24 rounded-2xl border border-[var(--color-border)] bg-[var(--color-subtle)]/50 p-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {t("credentialsHeading")}
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-[var(--color-foreground)]/85">
                  {credentials.map((c) => (
                    <li
                      key={c}
                      className="flex items-start gap-2 border-t border-[var(--color-border)] pt-3 first:border-t-0 first:pt-0"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-brand-600)]" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-subtle)]/40 py-16 md:py-20">
        <Container>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {t("valuesHeading")}
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {v.body}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
