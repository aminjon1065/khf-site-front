import Link from "@/components/i18n/LocaleLink";
import PageShell from "@/components/public/PageShell";
import { muted } from "@/components/public/ui";
import type { Metadata } from "next";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";
import { getSitemap, type SitemapLink } from "./content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { common, pages } = getDictionary(locale);
  return buildMetadata({ locale, title: pages.meta.sitemap, path: "/sitemap", siteName: common.siteShort });
}

/**
 * Ссылка карты сайта. Цвет по умолчанию — текст, при наведении — акцент с
 * подчёркиванием (оба через Tailwind, чтобы hover не перебивался инлайн-стилем).
 */
function SmapLink({ link }: { link: SitemapLink }) {
  return (
    <Link
      href={link.href}
      aria-current={link.current ? "page" : undefined}
      className="text-[14px] leading-[1.6] text-[color:var(--color-text)] no-underline [text-underline-offset:3px] hover:text-[color:var(--color-accent-700)] hover:underline"
    >
      {link.label}
    </Link>
  );
}

export default async function SitemapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = toLocale((await params).locale);
  const sitemap = getSitemap(locale);
  return (
    <PageShell
      active=""
      locale={locale}
      mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-8 max-[920px]:px-4"
    >
      <div className="border-b border-[var(--color-divider)] pb-[14px]">
        <h1 className="m-0 text-[36px] uppercase tracking-[.02em]">
          {sitemap.title}
        </h1>
        <p className="m-0 mt-2 text-[13px]" style={{ color: muted(60) }}>
          {sitemap.intro}
        </p>
      </div>

      <div className="mt-7 grid grid-cols-3 gap-8 max-[920px]:grid-cols-1">
        {sitemap.groups.map((group) => (
          <div key={group.title}>
            <h6 className="m-0 mb-2.5" style={{ color: muted(55) }}>
              {group.title}
            </h6>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {group.links.map((link) => (
                <li key={link.label} className={link.spaced ? "mt-2" : undefined}>
                  <SmapLink link={link} />
                  {link.children && (
                    <ul className="mt-1 flex list-none flex-col gap-1 border-l border-[var(--color-divider)] pl-4">
                      {link.children.map((child) => (
                        <li key={child.label}>
                          <SmapLink link={child} />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
