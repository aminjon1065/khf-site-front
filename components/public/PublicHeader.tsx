import { Fragment } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { ChevronDown, Phone, Search, Smartphone, X } from "lucide-react";
import emblemImage from "@/public/assets/emblem-tj.png";
import flagImage from "@/public/assets/flag-tj.png";
import logoImage from "@/public/assets/logo-kchs-ru.webp";
import LocaleSwitcher from "@/components/public/header/LocaleSwitcher";
import MobileMenuButton from "@/components/public/header/MobileMenuButton";
import ThemeToggle from "@/components/public/header/ThemeToggle";
import { muted } from "@/components/public/muted";
import type { ApiMenuItem } from "@/lib/api";
import { withLocale, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { routes, type NavKey } from "@/lib/routes";

interface NavItem {
  label: string;
  href: string;
  children: { label: string; href: string }[];
}

const activeRoutes: Partial<Record<NavKey, string>> = {
  home: routes.home,
  news: routes.news,
  guides: routes.guides,
  map: routes.map,
  documents: routes.documents,
  projects: routes.projects,
  announcements: routes.announcements,
  contacts: routes.contacts,
};

export default function PublicHeader({
  active = "",
  trustPhone,
  locale,
  copy,
  mainMenu,
}: {
  active?: NavKey;
  trustPhone?: string;
  locale: Locale;
  copy: Dictionary["common"];
  /** Главное меню из CMS (`/menu`.main). Задаёт состав/порядок пунктов. */
  mainMenu?: ApiMenuItem[];
}) {
  const { header, nav: navCopy } = copy;
  const navLabelByUrl: Record<string, string> = {
    [routes.news]: navCopy.news,
    [routes.guides]: navCopy.guides,
    [routes.map]: navCopy.map,
    [routes.documents]: navCopy.documents,
    [routes.contacts]: navCopy.contacts,
    [routes.projects]: navCopy.projects,
    [routes.announcements]: navCopy.announcements,
    [routes.leadership]: navCopy.leadership,
    [routes.structure]: navCopy.structure,
  };
  const staticNav: NavItem[] = [
    { label: navCopy.news, href: routes.news, children: [] },
    { label: navCopy.guides, href: routes.guides, children: [] },
    { label: navCopy.map, href: routes.map, children: [] },
    { label: navCopy.documents, href: routes.documents, children: [] },
    { label: navCopy.projects, href: routes.projects, children: [] },
    {
      label: navCopy.announcements,
      href: routes.announcements,
      children: [],
    },
    { label: navCopy.contacts, href: routes.contacts, children: [] },
  ];

  const toNavItem = (item: ApiMenuItem): NavItem | null => {
    const href = item.url ?? "";
    if (!href || href === "/") {
      return null;
    }

    const label = navLabelByUrl[href] ?? item.label;
    if (!label.trim()) {
      return null;
    }

    const children = (item.children ?? [])
      .map((child): { label: string; href: string } | null => {
        const childHref = child.url ?? "";
        const childLabel = childHref
          ? (navLabelByUrl[childHref] ?? child.label)
          : child.label;

        return childHref && childLabel.trim()
          ? { label: childLabel, href: childHref }
          : null;
      })
      .filter(
        (child): child is { label: string; href: string } => child !== null,
      );

    return { label, href, children };
  };

  const cmsNav = (mainMenu ?? [])
    .map(toNavItem)
    .filter((item): item is NavItem => item !== null);
  const navItems = cmsNav.length > 0 ? cmsNav : staticNav;
  const isActiveHref = (href: string): boolean =>
    active !== "" && activeRoutes[active] === href;
  const phone = trustPhone || header.trustPhone;
  const phoneHref = `tel:${phone.replace(/[^+\d]/g, "")}`;
  const aboutActive = active === "about";
  const localize = (href: string): string => withLocale(locale, href);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-divider)] bg-[var(--color-bg)]">
      <div className="border-b border-[var(--color-divider)]">
        <div
          className="mx-auto flex w-full max-w-[1160px] items-center gap-3 px-6 py-1.5 text-xs max-[920px]:px-4"
          style={{ color: muted(65) }}
        >
          <Image
            src={flagImage}
            alt={header.flagAlt}
            width={26}
            height={13}
            className="h-[13px] w-auto border border-[var(--color-divider)]"
          />
          <Image
            src={emblemImage}
            alt={header.emblemAlt}
            width={18}
            height={18}
            className="h-[18px] w-auto"
          />
          <NextLink
            href={localize(routes.symbols)}
            className="toplink text-[11px] uppercase tracking-[.04em]"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {header.stateSymbols}
          </NextLink>
          <span className="flex-1" />
          <NextLink
            href={localize(routes.sitemap)}
            className="toplink px-1.5 py-1 max-[920px]:hidden"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {header.sitemap}
          </NextLink>
          <NextLink
            href={localize(routes.structure)}
            className="toplink px-1.5 py-1 max-[920px]:hidden"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {header.subdivisions}
          </NextLink>
          <ThemeToggle label={header.themeToggle} title={header.themeTitle} />
          <LocaleSwitcher label={header.langGroup} locale={locale} />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center gap-4 px-6 py-4 max-[920px]:flex-nowrap max-[920px]:gap-2.5 max-[920px]:px-4 max-[920px]:py-2.5">
        <NextLink
          href={localize(routes.home)}
          className="flex min-w-0 items-center gap-[14px] max-[920px]:flex-1"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Image
            src={logoImage}
            alt={header.logoAlt}
            width={57}
            height={56}
            className="h-14 w-auto max-[920px]:h-11"
            style={{ width: "auto" }}
          />
          <span className="block min-w-0">
            <span className="block text-[19px] font-semibold uppercase leading-[1.15] tracking-[.01em] [font-family:var(--font-heading)] max-[920px]:text-[14.5px]">
              {header.committeeTitle[0]}
              <br />
              {header.committeeTitle[1]}
            </span>
            <span
              className="mt-[3px] block text-xs max-[920px]:hidden"
              style={{ color: muted(60) }}
            >
              {header.committeeSub}
            </span>
          </span>
        </NextLink>
        <span className="flex-1 max-[920px]:hidden" />
        <span
          className="text-right text-xs leading-[1.4] max-[920px]:hidden"
          style={{ color: muted(60) }}
        >
          {header.trustPhoneLabel}
          <br />
          <a
            href={phoneHref}
            className="text-[13px] font-medium"
            style={{ color: "var(--color-accent-700)", textDecoration: "none" }}
          >
            {phone}
          </a>
        </span>
        <a
          href="tel:112"
          className="call-112 inline-flex items-center gap-2 border border-[var(--color-divider)] px-[18px] py-2.5 text-[16px] font-semibold uppercase tracking-[.03em] text-white [box-shadow:var(--shadow-sm)] [font-family:var(--font-heading)] max-[920px]:ml-auto max-[920px]:px-[13px] max-[920px]:py-[9px] max-[920px]:text-[15px]"
          aria-label={header.emergencyAria}
          style={{ background: "var(--hz-critical)", textDecoration: "none" }}
        >
          <Phone size={16} strokeWidth={1.5} aria-hidden="true" />
          112
        </a>
        <MobileMenuButton
          menuId="public-mobile-menu"
          openLabel={header.openMenu}
        />
      </div>

      <dialog
        id="public-mobile-menu"
        className="mnav m-0 ml-auto border-0 p-0"
        aria-label={header.menu}
      >
        <div className="flex items-center gap-3 border-b border-[var(--color-divider)] py-[14px] pl-5 pr-4">
          <Image
            src={logoImage}
            alt=""
            width={35}
            height={34}
            className="h-[34px] w-[35px]"
          />
          <span className="flex-1 text-[15px] font-semibold uppercase [font-family:var(--font-heading)]">
            {header.menu}
          </span>
          <form method="dialog">
            <button
              aria-label={header.closeMenu}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center border border-[var(--color-divider)] bg-transparent"
              style={{ color: "var(--color-text)" }}
            >
              <X size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </form>
        </div>
        <form
          role="search"
          method="get"
          action={localize("/search")}
          className="border-b border-[var(--color-divider)] px-5 py-[14px]"
        >
          <div className="relative flex items-center">
            <Search
              size={16}
              strokeWidth={1.5}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: muted(55) }}
            />
            <input
              className="input min-h-[44px] w-full pl-9 text-[15px]"
              type="search"
              name="q"
              minLength={2}
              required
              placeholder={header.searchPlaceholder}
              aria-label={header.searchPlaceholder}
            />
          </div>
        </form>
        <nav className="flex flex-col" aria-label={header.mobileNavAria}>
          <NextLink className="mnav-link" href={localize(routes.home)}>
            {navCopy.home}
          </NextLink>
          <span
            className="flex min-h-[40px] items-center px-5 pt-2.5 text-[11px] uppercase tracking-[.1em]"
            style={{ color: muted(50) }}
          >
            {header.aboutMenu}
          </span>
          <NextLink
            className="mnav-link mnav-sub"
            href={localize(routes.leadership)}
          >
            {navCopy.leadership}
          </NextLink>
          <NextLink
            className="mnav-link mnav-sub"
            href={localize(routes.structure)}
          >
            {navCopy.structure}
          </NextLink>
          <NextLink
            className="mnav-link mnav-sub"
            href={localize(routes.symbols)}
          >
            {header.stateSymbols}
          </NextLink>
          {navItems.map((item) => (
            <Fragment key={item.href}>
              <NextLink className="mnav-link" href={localize(item.href)}>
                {item.label}
              </NextLink>
              {item.children.map((child) => (
                <NextLink
                  key={child.href}
                  className="mnav-link mnav-sub"
                  href={localize(child.href)}
                >
                  {child.label}
                </NextLink>
              ))}
            </Fragment>
          ))}
          <NextLink
            className="mnav-link"
            href={localize(routes.sos)}
            style={{ color: "var(--color-accent-700)" }}
          >
            <Smartphone
              size={16}
              strokeWidth={1.5}
              aria-hidden="true"
              className="mr-[9px]"
            />
            {header.sosApp}
          </NextLink>
        </nav>
        <div className="mt-auto flex flex-col gap-2.5 border-t border-[var(--color-divider)] px-5 py-[18px]">
          <a
            href="tel:112"
            className="flex min-h-[48px] items-center justify-center gap-2 text-[17px] font-semibold uppercase tracking-[.03em] text-white [font-family:var(--font-heading)]"
            style={{
              background: "var(--hz-critical)",
              textDecoration: "none",
            }}
          >
            <Phone size={16} strokeWidth={1.5} aria-hidden="true" />
            {header.emergencyCallMobile}
          </a>
          <span
            className="text-center text-[12.5px]"
            style={{ color: muted(60) }}
          >
            {header.trustLineMobile}{" "}
            <a href={phoneHref} style={{ color: "var(--color-accent-700)" }}>
              {phone}
            </a>
          </span>
        </div>
      </dialog>

      <nav
        className="knav border-t border-[var(--color-divider)] max-[920px]:hidden"
        aria-label={header.navAria}
      >
        <div className="mx-auto flex w-full max-w-[1160px] flex-nowrap items-center gap-0.5 px-6">
          <NextLink
            href={localize(routes.home)}
            aria-current={active === "home" ? "page" : undefined}
          >
            {navCopy.home}
          </NextLink>
          <details className="group relative inline-block shrink-0">
            <summary
              className="inline-flex cursor-pointer list-none items-center gap-[5px] border-none bg-transparent px-[13px] py-[9px] text-sm [font:inherit] [&::-webkit-details-marker]:hidden"
              style={{
                color: aboutActive
                  ? "var(--color-accent-700)"
                  : "var(--color-text)",
                borderBottom: `2px solid ${aboutActive ? "var(--color-accent)" : "transparent"}`,
              }}
            >
              {header.aboutMenu}
              <ChevronDown
                className="transition-transform group-open:rotate-180"
                size={13}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </summary>
            <span
              role="menu"
              className="absolute left-0 top-full z-50 flex min-w-[200px] flex-col border border-[var(--color-divider)] bg-[var(--color-bg)] py-1 [box-shadow:var(--shadow-md)]"
            >
              <NextLink
                role="menuitem"
                href={localize(routes.leadership)}
                className="!border-b-0 px-[14px] py-2"
              >
                {navCopy.leadership}
              </NextLink>
              <NextLink
                role="menuitem"
                href={localize(routes.structure)}
                className="!border-b-0 px-[14px] py-2"
              >
                {navCopy.structure}
              </NextLink>
              <NextLink
                role="menuitem"
                href={localize(routes.symbols)}
                className="!border-b-0 px-[14px] py-2"
              >
                {header.stateSymbols}
              </NextLink>
            </span>
          </details>
          {navItems.map((item) =>
            item.children.length > 0 ? (
              <details
                key={item.href}
                className="group relative inline-block shrink-0"
              >
                <summary
                  className="inline-flex cursor-pointer list-none items-center gap-[5px] border-none bg-transparent px-[13px] py-[9px] text-sm [font:inherit] [&::-webkit-details-marker]:hidden"
                  style={{
                    color: isActiveHref(item.href)
                      ? "var(--color-accent-700)"
                      : "var(--color-text)",
                    borderBottom: `2px solid ${isActiveHref(item.href) ? "var(--color-accent)" : "transparent"}`,
                  }}
                >
                  {item.label}
                  <ChevronDown
                    className="transition-transform group-open:rotate-180"
                    size={13}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </summary>
                <span
                  role="menu"
                  className="absolute left-0 top-full z-50 flex min-w-[200px] flex-col border border-[var(--color-divider)] bg-[var(--color-bg)] py-1 [box-shadow:var(--shadow-md)]"
                >
                  {item.children.map((child) => (
                    <NextLink
                      key={child.href}
                      role="menuitem"
                      href={localize(child.href)}
                      className="!border-b-0 px-[14px] py-2"
                    >
                      {child.label}
                    </NextLink>
                  ))}
                </span>
              </details>
            ) : (
              <NextLink
                key={item.href}
                href={localize(item.href)}
                aria-current={isActiveHref(item.href) ? "page" : undefined}
              >
                {item.label}
              </NextLink>
            ),
          )}
          <span className="flex-1" />
          <NextLink
            href={localize(routes.sos)}
            className="sos-outline mr-2.5 inline-flex items-center gap-[7px] border border-[var(--color-accent)] px-[14px] py-1.5 text-[13.5px] font-semibold [font-family:var(--font-heading)]"
            style={{
              color: "var(--color-accent-700)",
              background: "transparent",
            }}
          >
            <Smartphone size={14} strokeWidth={1.5} aria-hidden="true" />
            {header.sosApp}
          </NextLink>
          <form
            role="search"
            method="get"
            action={localize("/search")}
            className="relative flex min-w-[116px] shrink grow-0 basis-[190px] items-center py-1"
          >
            <Search
              size={14}
              strokeWidth={1.5}
              aria-hidden="true"
              className="pointer-events-none absolute left-[9px] top-1/2 -translate-y-1/2"
              style={{ color: muted(55) }}
            />
            <input
              className="input h-[30px] min-h-[30px] w-full min-w-0 pl-[28px] text-[13px]"
              type="search"
              name="q"
              minLength={2}
              required
              placeholder={header.searchPlaceholder}
              aria-label={header.searchPlaceholder}
            />
          </form>
        </div>
      </nav>
    </header>
  );
}
