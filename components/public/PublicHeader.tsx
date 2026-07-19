"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Moon, Sun, Phone, ChevronDown, Smartphone, Menu, X } from "lucide-react";
import { common } from "@/lib/copy/common";
import { routes, type NavKey } from "@/lib/routes";
import { muted } from "@/components/public/ui";

const { header, nav: navCopy, langNotice } = common;
type Lang = "ru" | "tj" | "en";

const mainNav: { key: NavKey; label: string; href: string }[] = [
  { key: "news", label: navCopy.news, href: routes.news },
  { key: "guides", label: navCopy.guides, href: routes.guides },
  { key: "map", label: navCopy.map, href: routes.map },
  { key: "documents", label: navCopy.documents, href: routes.documents },
  { key: "contacts", label: navCopy.contacts, href: routes.contacts },
];

export default function PublicHeader({ active = "" }: { active?: NavKey }) {
  const [lang, setLang] = useState<Lang>("ru");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const aboutRef = useRef<HTMLSpanElement>(null);

  // Клик вне дропдауна «О нас» и Escape — закрытие.
  useEffect(() => {
    if (!aboutOpen) return;
    const onDown = (e: MouseEvent) => {
      if (aboutRef.current && !aboutRef.current.contains(e.target as Node))
        setAboutOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAboutOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [aboutOpen]);

  // Блокировка прокрутки фона и Escape при открытом мобильном меню.
  useEffect(() => {
    if (!navOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNavOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [navOpen]);

  const toggleTheme = () => {
    const el = document.documentElement;
    const dark = el.getAttribute("data-theme") === "dark";
    if (dark) {
      el.removeAttribute("data-theme");
      localStorage.setItem("kchs-theme", "light");
    } else {
      el.setAttribute("data-theme", "dark");
      localStorage.setItem("kchs-theme", "dark");
    }
  };

  const aboutActive = active === "about";

  return (
    <header className="border-b border-[var(--color-divider)]">
      {/* Ярус 1 — служебная панель */}
      <div className="border-b border-[var(--color-divider)]">
        <div
          className="mx-auto flex w-full max-w-[1160px] items-center gap-3 px-6 py-1.5 text-xs max-[920px]:px-4"
          style={{ color: muted(65) }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/flag-tj.png"
            alt="Флаг Республики Таджикистан"
            className="h-[13px] w-auto border border-[var(--color-divider)]"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/emblem-tj.png"
            alt="Герб Республики Таджикистан"
            className="h-[18px] w-auto"
          />
          <Link
            href={routes.symbols}
            className="toplink text-[11px] uppercase tracking-[.04em]"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {header.stateSymbols}
          </Link>
          <span className="flex-1" />
          <Link
            href={routes.sitemap}
            className="toplink px-1.5 py-1 max-[920px]:hidden"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {header.sitemap}
          </Link>
          <Link
            href={routes.structure}
            className="toplink px-1.5 py-1 max-[920px]:hidden"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {header.subdivisions}
          </Link>
          <button
            onClick={toggleTheme}
            aria-label={header.themeToggle}
            title={header.themeTitle}
            className="toplink inline-flex cursor-pointer items-center gap-1.5 border border-transparent bg-transparent px-1.5 py-1 [font:inherit]"
            style={{ color: "inherit" }}
          >
            <Moon className="ico-moon" size={15} strokeWidth={1.5} aria-hidden="true" />
            <Sun className="ico-sun" size={15} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <span className="seg" role="group" aria-label={header.langGroup}>
            {(["ru", "tj", "en"] as Lang[]).map((l) => (
              <label key={l} className="seg-opt px-2.5 py-[3px] text-xs">
                <input
                  type="radio"
                  name="lang"
                  checked={lang === l}
                  onChange={() => setLang(l)}
                />
                {l === "ru" ? "РУ" : l === "tj" ? "ТҶ" : "EN"}
              </label>
            ))}
          </span>
        </div>
      </div>

      {/* Нотис об отсутствии перевода */}
      {lang === "tj" && (
        <div
          className="px-6 py-[5px] text-center text-xs"
          style={{ background: "var(--hz-info-bg)", color: "var(--hz-info)" }}
        >
          {langNotice.tj}
        </div>
      )}
      {lang === "en" && (
        <div
          className="px-6 py-[5px] text-center text-xs"
          style={{ background: "var(--hz-info-bg)", color: "var(--hz-info)" }}
        >
          {langNotice.en}
        </div>
      )}

      {/* Ярус 2 — бренд-строка */}
      <div className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center gap-4 px-6 py-4 max-[920px]:flex-nowrap max-[920px]:gap-2.5 max-[920px]:px-4 max-[920px]:py-2.5">
        <Link
          href={routes.home}
          className="flex min-w-0 items-center gap-[14px] max-[920px]:flex-1"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo-kchs-ru.webp"
            alt="Эмблема КЧС Республики Таджикистан"
            className="h-14 w-auto max-[920px]:h-11"
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
        </Link>
        <span className="flex-1 max-[920px]:hidden" />
        <span
          className="text-right text-xs leading-[1.4] max-[920px]:hidden"
          style={{ color: muted(60) }}
        >
          {header.trustPhoneLabel}
          <br />
          <a
            href={header.trustPhoneHref}
            className="text-[13px] font-medium"
            style={{ color: "var(--color-accent-700)", textDecoration: "none" }}
          >
            {header.trustPhone}
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
        <button
          onClick={() => setNavOpen(true)}
          aria-expanded={navOpen}
          aria-label={header.openMenu}
          className="hidden h-[46px] w-[46px] flex-none cursor-pointer items-center justify-center border border-[var(--color-divider)] bg-transparent max-[920px]:inline-flex"
          style={{ color: "var(--color-text)" }}
        >
          <Menu size={20} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      {/* Ярус 3 — основная навигация (десктоп) */}
      <nav
        className="knav border-t border-[var(--color-divider)] max-[920px]:hidden"
        aria-label="Основная навигация"
      >
        <div className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center gap-0.5 px-6">
          <Link href={routes.home} aria-current={active === "home" ? "page" : undefined}>
            {navCopy.home}
          </Link>
          <span ref={aboutRef} className="relative inline-block">
            <button
              onClick={() => setAboutOpen((v) => !v)}
              aria-expanded={aboutOpen}
              aria-haspopup="true"
              className="inline-flex cursor-pointer items-center gap-[5px] border-none bg-transparent px-[13px] py-[9px] text-sm [font:inherit]"
              style={{
                color: aboutActive ? "var(--color-accent-700)" : "var(--color-text)",
                borderBottom: `2px solid ${aboutActive ? "var(--color-accent)" : "transparent"}`,
              }}
            >
              {header.aboutMenu}
              <ChevronDown size={13} strokeWidth={1.5} aria-hidden="true" />
            </button>
            {aboutOpen && (
              <span
                role="menu"
                onClick={() => setAboutOpen(false)}
                className="absolute left-0 top-full z-50 flex min-w-[200px] flex-col border border-[var(--color-divider)] py-1"
                style={{ background: "var(--color-bg)", boxShadow: "var(--shadow-md)" }}
              >
                <Link
                  role="menuitem"
                  href={routes.leadership}
                  className="!border-b-0 px-[14px] py-2"
                >
                  {navCopy.leadership}
                </Link>
                <Link
                  role="menuitem"
                  href={routes.structure}
                  className="!border-b-0 px-[14px] py-2"
                >
                  {navCopy.structure}
                </Link>
                <Link
                  role="menuitem"
                  href={routes.symbols}
                  className="!border-b-0 px-[14px] py-2"
                >
                  {header.stateSymbols}
                </Link>
              </span>
            )}
          </span>
          {mainNav.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active === item.key ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          <span className="flex-1" />
          <Link
            href={routes.sos}
            className="sos-outline mr-2.5 inline-flex items-center gap-[7px] border border-[var(--color-accent)] px-[14px] py-1.5 text-[13.5px] font-semibold [font-family:var(--font-heading)]"
            style={{ color: "var(--color-accent-700)", background: "transparent" }}
          >
            <Smartphone size={14} strokeWidth={1.5} aria-hidden="true" />
            {header.sosApp}
          </Link>
          <form role="search" className="flex items-center gap-1.5 py-1">
            <input
              className="input h-[30px] w-[190px] min-h-[30px] text-[13px]"
              type="search"
              placeholder={header.searchPlaceholder}
              aria-label={header.searchPlaceholder}
            />
          </form>
        </div>
      </nav>

      {/* Мобильное выдвижное меню */}
      {navOpen && (
        <>
          <div className="mnav-backdrop" onClick={() => setNavOpen(false)} />
          <div className="mnav" role="dialog" aria-modal="true" aria-label={header.menu}>
            <div className="flex items-center gap-3 border-b border-[var(--color-divider)] py-[14px] pl-5 pr-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/logo-kchs-ru.webp" alt="" className="h-[34px] w-auto" />
              <span className="flex-1 text-[15px] font-semibold uppercase [font-family:var(--font-heading)]">
                {header.menu}
              </span>
              <button
                onClick={() => setNavOpen(false)}
                aria-label={header.closeMenu}
                className="inline-flex h-11 w-11 cursor-pointer items-center justify-center border border-[var(--color-divider)] bg-transparent"
                style={{ color: "var(--color-text)" }}
              >
                <X size={18} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
            <div className="border-b border-[var(--color-divider)] px-5 py-[14px]">
              <input
                className="input min-h-[44px] w-full text-[15px]"
                type="search"
                placeholder={header.searchPlaceholder}
                aria-label={header.searchPlaceholder}
              />
            </div>
            <nav
              className="flex flex-col"
              aria-label="Мобильная навигация"
              onClick={() => setNavOpen(false)}
            >
              <Link className="mnav-link" href={routes.home}>
                {navCopy.home}
              </Link>
              <span
                className="flex min-h-[40px] items-center px-5 pt-2.5 text-[11px] uppercase tracking-[.1em]"
                style={{ color: muted(50) }}
              >
                {header.aboutMenu}
              </span>
              <Link className="mnav-link mnav-sub" href={routes.leadership}>
                {navCopy.leadership}
              </Link>
              <Link className="mnav-link mnav-sub" href={routes.structure}>
                {navCopy.structure}
              </Link>
              <Link className="mnav-link mnav-sub" href={routes.symbols}>
                {header.stateSymbols}
              </Link>
              <Link className="mnav-link" href={routes.news}>
                {navCopy.news}
              </Link>
              <Link className="mnav-link" href={routes.guides}>
                {navCopy.guides}
              </Link>
              <Link className="mnav-link" href={routes.map}>
                {navCopy.map}
              </Link>
              <Link className="mnav-link" href={routes.documents}>
                {navCopy.documents}
              </Link>
              <Link className="mnav-link" href={routes.projects}>
                {navCopy.projects}
              </Link>
              <Link className="mnav-link" href={routes.announcements}>
                {navCopy.announcements}
              </Link>
              <Link className="mnav-link" href={routes.contacts}>
                {navCopy.contacts}
              </Link>
              <Link
                className="mnav-link"
                href={routes.sos}
                style={{ color: "var(--color-accent-700)" }}
              >
                <Smartphone
                  size={16}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="mr-[9px]"
                />
                {header.sosApp}
              </Link>
            </nav>
            <div className="mt-auto flex flex-col gap-2.5 border-t border-[var(--color-divider)] px-5 py-[18px]">
              <a
                href="tel:112"
                className="flex min-h-[48px] items-center justify-center gap-2 text-[17px] font-semibold uppercase tracking-[.03em] text-white [font-family:var(--font-heading)]"
                style={{ background: "var(--hz-critical)", textDecoration: "none" }}
              >
                <Phone size={16} strokeWidth={1.5} aria-hidden="true" />
                {header.emergencyCallMobile}
              </a>
              <span
                className="text-center text-[12.5px]"
                style={{ color: muted(60) }}
              >
                {header.trustLineMobile}{" "}
                <a href={header.trustPhoneHref} style={{ color: "var(--color-accent-700)" }}>
                  {header.trustPhone}
                </a>
              </span>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
