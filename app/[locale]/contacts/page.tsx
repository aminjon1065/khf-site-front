import PageShell from "@/components/public/PageShell";
import { muted } from "@/components/public/ui";
import { fetchRegionsDirectory, fetchSettings } from "@/lib/api";
import type { Metadata } from "next";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata, metaDescription } from "@/lib/seo";
import { getContacts, withContactSettings } from "./content";
import ContactForm from "./ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { common, pages } = getDictionary(locale);
  return buildMetadata({
    locale,
    title: pages.meta.contacts,
    // Описание берём из уже переведённого подзаголовка самой страницы —
    // отдельный текст пришлось бы переводить и поддерживать втрое.
    description: metaDescription(getContacts(locale).subtitle),
    path: "/contacts",
    siteName: common.siteShort,
  });
}

export const revalidate = 60;

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = toLocale((await params).locale);
  const contacts = getContacts(locale);
  const { offices, reception } = contacts;

  // Региональные управления приходят из CMS; при недоступности — статичный список.
  // Телефон доверия, адрес и e-mail центрального аппарата — из настроек CMS,
  // без них — встроенный текст (withContactSettings).
  const [directory, settings] = await Promise.all([
    fetchRegionsDirectory(locale),
    fetchSettings(locale),
  ]);
  const emergency = withContactSettings(contacts.emergency, settings?.org);
  const officeRows =
    directory.length > 0
      ? directory.map((o) => ({
          name: o.name,
          head: o.head,
          address: o.address,
          tel: o.phone ?? "",
          telHref: o.phone_href ?? "",
          email: o.email ?? "",
        }))
      : offices.rows;

  return (
    <PageShell>
      {/* Заголовок страницы */}
      <div className="page-head">
        <h1 className="page-title page-title-caps">{contacts.title}</h1>
        <span className="page-subtitle">
          {contacts.subtitle}
        </span>
      </div>

      {/* Экстренная помощь — три карточки */}
      <section
        aria-label={emergency.ariaLabel}
        className="mt-6 grid grid-cols-3 gap-[14px] max-[920px]:grid-cols-1"
      >
        {/* Угроза жизни — 112 */}
        <div
          className="blueprint p-5 transition-all hover:shadow-md"
          style={{
            borderTop: "4px solid var(--hz-critical-solid)",
            background: "color-mix(in srgb, var(--hz-critical-solid) 4%, var(--color-card))",
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="kicker-heading m-0 mb-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--hz-critical)" }}>
              {emergency.critical.kicker}
            </h2>
            <span className="tag tag-danger text-[11px] font-bold uppercase">24/7</span>
          </div>
          <a
            href={emergency.critical.phoneHref}
            className="my-1 block text-[38px] font-bold leading-none no-underline transition-opacity hover:opacity-85 [font-family:var(--font-heading)]"
            style={{ color: "var(--hz-critical)" }}
          >
            {emergency.critical.phone}
          </a>
          <p className="mb-0 mt-2 text-[12.5px] leading-[1.5]" style={{ color: muted(62) }}>
            {emergency.critical.note}
          </p>
        </div>

        {/* Телефон доверия */}
        <div
          className="blueprint p-5 transition-all hover:shadow-md"
          style={{ borderTop: "4px solid var(--color-accent)" }}
        >
          <h2 className="kicker-heading m-0 mb-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: muted(55) }}>
            {emergency.trust.kicker}
          </h2>
          <a
            href={emergency.trust.phoneHref}
            className="my-1 block text-[24px] font-bold leading-tight no-underline transition-opacity hover:opacity-85 [font-family:var(--font-heading)]"
            style={{ color: "var(--color-accent-700)" }}
          >
            {emergency.trust.phone}
          </a>
          <p className="mb-0 mt-2 text-[12.5px] leading-[1.5]" style={{ color: muted(62) }}>
            {emergency.trust.note}
          </p>
        </div>

        {/* Центральный аппарат — адрес */}
        <div
          className="blueprint p-5 transition-all hover:shadow-md"
          style={{ borderTop: "4px solid var(--color-divider)" }}
        >
          <h2 className="kicker-heading m-0 mb-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: muted(55) }}>
            {emergency.hq.kicker}
          </h2>
          <p className="m-0 mt-2 text-[13.5px] leading-[1.6]">
            {emergency.hq.address}
            <br />
            <a
              href={emergency.hq.emailHref}
              className="font-medium hover:underline"
              style={{ color: "var(--color-accent-700)" }}
            >
              {emergency.hq.email}
            </a>
            {" · "}
            <span className="text-slate-500 dark:text-slate-400">{emergency.hq.hours}</span>
          </p>
        </div>
      </section>

      {/* Региональные управления + электронная приёмная */}
      <div className="mt-10 grid grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)] items-start gap-8 max-[920px]:grid-cols-1">
        <section aria-label={offices.ariaLabel} className="min-w-0">
          <div className="mb-1.5 flex items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-[10px]">
            <h2 className="m-0 text-[23px] uppercase tracking-[.02em]">{offices.title}</h2>
          </div>
          {officeRows.map((o) => (
            <div
              key={o.email || o.name}
              className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] items-baseline gap-[14px] border-b border-[var(--color-divider)] px-0.5 py-4 max-[560px]:grid-cols-1"
            >
              <div>
                <span className="block text-[17px] font-semibold [font-family:var(--font-heading)]">
                  {o.name}
                </span>
                <span className="text-[12.5px]" style={{ color: muted(58) }}>
                  {o.head}
                </span>
              </div>
              <div className="text-[13px] leading-[1.5]" style={{ color: muted(70) }}>
                {o.address}
              </div>
              <div className="text-[13px] leading-[1.5]">
                <a
                  href={`tel:${o.telHref}`}
                  className="no-underline"
                  style={{ color: "var(--color-accent-700)" }}
                >
                  {o.tel}
                </a>
                {o.email && (
                  <span className="block" style={{ color: muted(58) }}>
                    <a
                      href={`mailto:${o.email}`}
                      className="no-underline"
                      style={{ color: muted(58) }}
                    >
                      {o.email}
                    </a>
                  </span>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Якорь приёмной: карточка «Написать обращение» на главной ведёт
            прямо к форме, а не в начало страницы контактов. */}
        <aside id="reception" className="blueprint flex scroll-mt-28 flex-col gap-3.5 p-6 shadow-sm">
          <h2 className="m-0 text-[21px] font-bold uppercase tracking-[.02em] [font-family:var(--font-heading)]">{reception.title}</h2>
          <p className="m-0 text-[13px] leading-[1.55]" style={{ color: muted(65) }}>
            {reception.intro}
          </p>
          {/* Форма — для несрочных обращений: обещание интерфейса не должно
              выглядеть каналом экстренной помощи. */}
          <div
            className="rounded-lg border border-amber-200/80 bg-amber-50/80 p-3 text-[12.5px] leading-[1.5] text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
          >
            {reception.urgentNote}
          </div>
          <ContactForm reception={reception} locale={locale} />
        </aside>
      </div>
    </PageShell>
  );
}
