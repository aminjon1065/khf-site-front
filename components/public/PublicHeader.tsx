import { Fragment } from "react";
// LocaleLink, а не next/link: href в шапке уже локализованы (withLocale
// идемпотентна), зато каждая ссылка сообщает полосе прогресса о старте перехода.
import NextLink from "@/components/i18n/LocaleLink";
import Image from "next/image";
import { Phone, Search, Smartphone, X } from "lucide-react";
import emblemImage from "@/public/assets/emblem-tj.png";
import flagImage from "@/public/assets/flag-tj.png";
import { logoByLocale } from "@/components/public/logo";
import LocaleSwitcher from "@/components/public/header/LocaleSwitcher";
import MobileMenuButton from "@/components/public/header/MobileMenuButton";
import SearchButton from "@/components/public/header/SearchButton";
import CompactOnScroll from "@/components/public/header/CompactOnScroll";
import HeaderOverlays from "@/components/public/header/HeaderOverlays";
import NavLink from "@/components/public/header/NavLink";
import NavSummary from "@/components/public/header/NavSummary";
import ThemeToggle from "@/components/public/header/ThemeToggle";
import { muted } from "@/components/public/muted";
import { cmsMenuToNavItems } from "@/lib/cms-menu";
import type { ApiMenuItem } from "@/lib/api";
import { withLocale, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { routes } from "@/lib/routes";

/** id модального окна поиска: связывает кнопку-триггер и сам <dialog>. */
const SEARCH_DIALOG_ID = "public-search";

export default function PublicHeader({
  trustPhone,
  locale,
  copy,
  mainMenu,
}: {
  trustPhone?: string | null;
  locale: Locale;
  copy: Dictionary["common"];
  /** Главное меню из CMS (`/menu`.main). Задаёт состав/порядок пунктов. */
  mainMenu?: ApiMenuItem[];
}) {
  const { header, nav: navCopy } = copy;
  // Подписи встроенных разделов — запасные: пункт меню CMS показывается под
  // тем именем, что ввёл редактор, а словарь подставляется, только если
  // подпись на языке страницы пуста (см. cmsMenuToNavItems).
  const navLabelByUrl: Record<string, string> = {
    [routes.news]: navCopy.news,
    [routes.guides]: navCopy.guides,
    [routes.map]: navCopy.map,
    [routes.documents]: navCopy.documents,
    [routes.contacts]: navCopy.contacts,
    [routes.projects]: navCopy.projects,
    [routes.announcements]: navCopy.announcements,
    [routes.about]: navCopy.about,
    [routes.leadership]: navCopy.leadership,
    [routes.structure]: navCopy.structure,
  };
  const staticNav = [
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

  const cmsNav = cmsMenuToNavItems(mainMenu, navLabelByUrl);
  const navItems = cmsNav.length > 0 ? cmsNav : staticNav;
  const phone = trustPhone || header.trustPhone;
  const phoneHref = `tel:${phone.replace(/[^+\d]/g, "")}`;
  const localize = (href: string): string => withLocale(locale, href);
  const logoImage = logoByLocale[locale];

  return (
    <header className="ksite-header">
      <HeaderOverlays />
      <CompactOnScroll />
      <div className="ksite-utility border-b border-[var(--color-divider)]">
        {/* flex-wrap: при увеличении текста до 200% (WCAG 1.4.4) на экране
            360–390px служебная полоса — символы, тема, переключатель языка —
            не помещалась в строку и вызывала горизонтальную прокрутку всей
            страницы. С переносом она занимает две строки, а прокрутки нет.
            На обычном кегле состав строки не меняется: там она и так влезает. */}
        <div
          className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center gap-3 px-6 py-1.5 text-xs max-[920px]:gap-1.5 max-[920px]:px-4 max-[920px]:py-0"
          style={{ color: muted(80) }}
        >
          <NextLink
            href={localize(routes.symbols)}
            className="toplink flex items-center gap-2 text-[11px] uppercase tracking-[.04em] max-[920px]:min-h-11 max-[920px]:min-w-11 max-[920px]:justify-center"
            style={{ color: "inherit", textDecoration: "none" }}
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
              alt=""
              width={18}
              height={18}
              className="h-[18px] w-auto"
            />
            <span className="max-[400px]:sr-only">{header.stateSymbols}</span>
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

      <div className="ksite-brand">
        <div className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center gap-4 px-6 py-4 max-[920px]:flex-nowrap max-[920px]:gap-2.5 max-[920px]:px-4 max-[920px]:py-2.5">
          <NextLink
            href={localize(routes.home)}
            className="flex min-w-0 items-center gap-[14px] max-[920px]:flex-1"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {/* sizes по фактическому размеру в вёрстке, а не по размеру
                файла. Статический импорт объявляет 512×506, и без подсказки
                Next строит srcset «640w 1x, 1080w 2x» — на мобильном с DPR
                2,625 браузер скачивал вариант 1080 px (46 KiB) ради эмблемы
                высотой 44 px. Герб почти квадратный, поэтому ширина ≈ высоте. */}
            <Image
              src={logoImage}
              alt={header.logoAlt}
              sizes="(max-width: 920px) 45px, 57px"
              className="h-14 w-auto max-[920px]:h-11"
              style={{ width: "auto" }}
            />
            <span className="block min-w-0">
              <span className="block text-[17.5px] font-bold leading-[1.2] tracking-[-0.01em] [font-family:var(--font-heading)] max-[920px]:text-[14px]">
                {header.committeeTitle[0]}
                <br />
                {header.committeeTitle[1]}
              </span>
              <span
                className="mt-1 block text-[11.5px] tracking-normal text-slate-500 dark:text-slate-400 max-[920px]:hidden"
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
              className="text-[13px] font-semibold text-sky-900 dark:text-sky-300"
              style={{
                textDecoration: "none",
              }}
            >
              {phone}
            </a>
          </span>
          <a
            href="tel:112"
            className="call-112 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-[15px] font-bold tracking-wider text-white shadow-sm hover:shadow transition-all max-[920px]:ml-auto max-[920px]:px-3.5 max-[920px]:py-2 max-[920px]:text-[14px]"
            aria-label={header.emergencyAria}
            style={{
              background: "var(--hz-critical-solid)",
              textDecoration: "none",
            }}
          >
            <Phone size={16} strokeWidth={2} aria-hidden="true" />
            112
          </a>
          <MobileMenuButton
            menuId="public-mobile-menu"
            openLabel={header.openMenu}
          />
        </div>
      </div>

      <dialog
        id="public-mobile-menu"
        className="mnav m-0 ml-auto border-0 p-0"
        aria-label={header.menu}
      >
        <div className="mnav-head flex items-center gap-3 border-b border-[var(--color-divider)] py-[14px] pl-5 pr-4">
          <Image
            src={logoImage}
            alt=""
            sizes="35px"
            className="h-[34px] w-auto"
          />
          <span className="flex-1 text-[15px] font-semibold uppercase [font-family:var(--font-heading)]">
            {header.menu}
          </span>
          <form method="dialog">
            <button
              aria-label={header.closeMenu}
              className="icon-btn inline-flex h-11 w-11 cursor-pointer items-center justify-center border border-[var(--color-divider)] bg-transparent"
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
          <NextLink className="mnav-link mnav-sub" href={localize(routes.about)}>
            {navCopy.about}
          </NextLink>
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
          {navItems.map((item, index) => (
            <Fragment key={`${item.href || item.label}-${index}`}>
              {item.href ? (
                <NextLink className="mnav-link" href={localize(item.href)}>
                  {item.label}
                </NextLink>
              ) : (
                <span
                  className="flex min-h-[40px] items-center px-5 pt-2.5 text-[11px] uppercase tracking-[.1em]"
                  style={{ color: muted(50) }}
                >
                  {item.label}
                </span>
              )}
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
              // Сплошная заливка под белым текстом — только --hz-critical-solid.
              // Базовый --hz-critical в тёмной теме равен #e26a60: белый 17px
              // на нём даёт 3.25:1 при требуемых по WCAG AA 4.5:1.
              background: "var(--hz-critical-solid)",
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
        className="knav border-y border-[var(--color-divider)] max-[920px]:hidden"
        aria-label={header.navAria}
      >
        {/* Две зоны: пункты (`.knav-primary`, переносятся) и инструменты
            (`.knav-tools`, не сжимаются). Иначе 112 в компактном режиме
            наезжает на последний пункт — пункты `flex: none`. */}
        <div className="knav-row mx-auto flex w-full max-w-[1160px] items-center px-6">
          <div className="knav-primary">
            <NavLink href={localize(routes.home)} match={routes.home}>
              {navCopy.home}
            </NavLink>
            <details className="group relative inline-block shrink-0">
              <NavSummary
                label={header.aboutMenu}
                matches={[
                  routes.about,
                  routes.leadership,
                  routes.structure,
                  routes.symbols,
                ]}
              />
              <span
                role="menu"
                className="knav-dropdown absolute left-0 top-full z-50 flex min-w-[210px] flex-col rounded-xl border border-[var(--color-divider)] bg-[var(--color-card)] p-1.5 shadow-lg"
              >
                <NextLink
                  role="menuitem"
                  href={localize(routes.about)}
                  className="!border-b-0 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {navCopy.about}
                </NextLink>
                <NextLink
                  role="menuitem"
                  href={localize(routes.leadership)}
                  className="!border-b-0 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {navCopy.leadership}
                </NextLink>
                <NextLink
                  role="menuitem"
                  href={localize(routes.structure)}
                  className="!border-b-0 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {navCopy.structure}
                </NextLink>
                <NextLink
                  role="menuitem"
                  href={localize(routes.symbols)}
                  className="!border-b-0 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {header.stateSymbols}
                </NextLink>
              </span>
            </details>
            {navItems.map((item, index) =>
              item.children.length > 0 ? (
                <details
                  key={`${item.href || item.label}-${index}`}
                  className="group relative inline-block shrink-0"
                >
                  <NavSummary
                    label={item.label}
                    matches={[
                      item.href,
                      ...item.children.map((child) => child.href),
                    ].filter(Boolean)}
                  />
                  <span
                    role="menu"
                    className="knav-dropdown absolute left-0 top-full z-50 flex min-w-[210px] flex-col rounded-xl border border-[var(--color-divider)] bg-[var(--color-card)] p-1.5 shadow-lg"
                  >
                    {item.children.map((child) => (
                      <NextLink
                        key={child.href}
                        role="menuitem"
                        href={localize(child.href)}
                        className="!border-b-0 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {child.label}
                      </NextLink>
                    ))}
                  </span>
                </details>
              ) : (
                <NavLink
                  key={`${item.href}-${index}`}
                  href={localize(item.href)}
                  match={item.href}
                >
                  {item.label}
                </NavLink>
              ),
            )}
          </div>
          <div className="knav-tools">
            <a
              href="tel:112"
              className="ksite-nav-112 call-112 items-center gap-[7px] px-3 py-1.5 text-[13.5px] font-semibold uppercase tracking-[.03em] text-white [font-family:var(--font-heading)]"
              aria-label={header.emergencyAria}
              style={{
                background: "var(--hz-critical-solid)",
                textDecoration: "none",
              }}
            >
              <Phone size={14} strokeWidth={1.5} aria-hidden="true" />
              112
            </a>
            <NextLink
              href={localize(routes.sos)}
              className="sos-outline inline-flex items-center gap-[7px] border border-[var(--color-accent)] px-3 py-1.5 text-[13.5px] font-semibold [font-family:var(--font-heading)]"
              aria-label={header.sosApp}
              title={header.sosApp}
              style={{
                color: "var(--color-accent-700)",
                background: "transparent",
              }}
            >
              <Smartphone size={14} strokeWidth={1.5} aria-hidden="true" />
              <span className="sos-label">{header.sosApp}</span>
            </NextLink>
            {/* Поиск открывается модальным окном (разметка — ниже, вне
                строки навигации). Раскрывающееся поле прямо здесь отнимало
                ширину у пунктов меню, и навигация перестраивалась на каждом
                фокусе. */}
            <SearchButton
              dialogId={SEARCH_DIALOG_ID}
              href={localize("/search")}
              label={header.searchShort}
              openLabel={header.searchOpen}
            />
          </div>
        </div>
      </nav>

      {/* Модальное окно поиска. Нативный <dialog>: Escape, ::backdrop,
          ловушка фокуса и возврат фокуса на кнопку — поведение браузера, а не
          самописное. Форма — та же GET-форма, что и на странице поиска, так
          что результат остаётся обычным адресом, которым можно поделиться.
          HeaderOverlays закрывает окно при переходе на другую страницу. */}
      <dialog
        id={SEARCH_DIALOG_ID}
        className="ksearch m-0 border-0 p-0"
        aria-label={header.searchPlaceholder}
      >
        {/* Заголовок и закрытие — вне формы поиска: вложенные <form>
            недопустимы, а `method="dialog"` закрывает окно средствами
            браузера, без обработчика (тот же приём, что в мобильном меню). */}
        <div className="flex items-center gap-2 px-5 pb-0 pt-5">
          <label
            htmlFor="ksearch-input"
            className="kicker-heading flex-1"
            style={{ color: muted(60) }}
          >
            {header.searchPlaceholder}
          </label>
          <form method="dialog">
            <button
              aria-label={header.searchClose}
              className="icon-btn inline-flex h-11 w-11 flex-none cursor-pointer items-center justify-center border border-[var(--color-divider)] bg-transparent"
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
          className="flex flex-col gap-3 p-5"
        >
          <div className="relative flex items-center">
            <Search
              size={17}
              strokeWidth={1.5}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: muted(55) }}
            />
            <input
              id="ksearch-input"
              className="input min-h-11 w-full pl-10 text-[15px]"
              type="search"
              name="q"
              minLength={2}
              required
              autoComplete="off"
              placeholder={header.searchPlaceholder}
              aria-describedby="ksearch-hint"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              id="ksearch-hint"
              className="min-w-0 flex-1 text-[13px]"
              style={{ color: muted(60) }}
            >
              {header.searchHint}
            </span>
            <button type="submit" className="btn btn-primary min-h-11 px-5">
              {header.searchSubmit}
            </button>
          </div>
        </form>
      </dialog>
    </header>
  );
}
