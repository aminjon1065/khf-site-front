import Image from "next/image";
import Link from "@/components/i18n/LocaleLink";
import { muted } from "@/components/public/ui";
import type { Locale } from "@/lib/i18n/config";
import { logoByLocale } from "@/components/public/logo";
import { flattenFooterMenu } from "@/lib/cms-menu";
import type { ApiMenuItem, ApiSettings } from "@/lib/api";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

/**
 * Общий подвал портала. Реквизиты, контакты, экстренные номера и меню приходят
 * из CMS (settings/menu) с фолбэком на статические строки из словаря локали.
 */
export default function PublicFooter({
  locale,
  settings,
  footerMenu,
  copy,
}: {
  locale: Locale;
  settings?: ApiSettings | null;
  footerMenu?: ApiMenuItem[];
  copy: Dictionary["common"];
}) {
  const { footer, header } = copy;
  const logoImage = logoByLocale[locale];
  const orgTitle = settings?.org.short_name || footer.orgTitle;
  const about = settings?.org.about || footer.about;
  const address = settings?.org.address || footer.address[0];
  const email = settings?.org.email || footer.address[1];
  // Email — контакт, а не упоминание: делаем его mailto-ссылкой, сохраняя
  // оформление (без подчёркивания до hover, как у остальных ссылок подвала).
  const emailHref = email.includes("@") ? `mailto:${email}` : null;

  // CMS-меню подвала задаёт состав/порядок пунктов, но его подписи не
  // локализованы (на /tj приходит русский фолбэк, на /en — пусто). Поэтому для
  // известных URL берём локализованную подпись из словаря (footer.sections) —
  // как и в шапке; для кастомных URL — подпись CMS; пустые пункты отбрасываем.
  const footerLabelByUrl: Record<string, string> = Object.fromEntries(
    footer.sections.map((s) => [s.href, s.label]),
  );
  const sections =
    footerMenu && footerMenu.length > 0
      ? flattenFooterMenu(footerMenu, footerLabelByUrl)
      : footer.sections;

  const emergency =
    settings?.emergency_services && settings.emergency_services.length > 0
      ? settings.emergency_services
      : footer.emergency;

  const trustPhone = settings?.org.trust_phone || header.trustPhone;
  const trustHref = `tel:${trustPhone.replace(/[^+\d]/g, "")}`;
  const copyright = settings?.copyright || footer.copyright;
  const social = settings?.social ?? {};
  const socialEntries = Object.entries(social).filter(([, v]) => v);

  return (
    <footer className="kfoot mt-16">
      <div className="mx-auto grid w-full max-w-[1160px] grid-cols-[minmax(240px,1.3fr)_repeat(3,minmax(160px,1fr))] gap-8 px-6 pb-7 pt-10 max-[920px]:grid-cols-2 max-[920px]:px-4 max-[560px]:grid-cols-1">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {/* См. комментарий в PublicHeader: sizes по размеру в вёрстке,
                иначе Next отдаёт вариант 1080 px под эмблему в 44 px. */}
            <Image
              src={logoImage}
              alt=""
              sizes="45px"
              className="h-11 w-auto"
              style={{ width: "auto" }}
            />
            <span className="text-[15px] font-semibold uppercase leading-tight [font-family:var(--font-heading)]">
              {orgTitle}
            </span>
          </div>
          <p
            className="m-0 text-[13px] leading-[1.55]"
            style={{ color: muted(78) }}
          >
            {about}
          </p>
          <p className="m-0 text-xs" style={{ color: muted(70) }}>
            {address}
            <br />
            {emailHref ? (
              <a href={emailHref} className="no-underline">
                {email}
              </a>
            ) : (
              email
            )}
          </p>
          {socialEntries.length > 0 && (
            <div className="flex flex-wrap gap-3 text-[12.5px]">
              {socialEntries.map(([k, v]) => (
                <a
                  key={k}
                  href={v}
                  target="_blank"
                  rel="noopener"
                  className="capitalize"
                >
                  {k}
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 kicker-heading" style={{ color: muted(72) }}>
            {footer.sectionsTitle}
          </h2>
          <div className="flex flex-col gap-2">
            {sections.map((s) => (
              <Link key={s.href} href={s.href}>
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 kicker-heading" style={{ color: muted(72) }}>
            {footer.emergencyTitle}
          </h2>
          <div className="flex flex-col items-start gap-2 text-[13px]">
            {emergency.map((e) => (
              // Номер — телефонная ссылка: на мобильном телефонный номер в
              // подвале обязан начинать звонок, а не быть текстом.
              <a
                key={e.num}
                href={`tel:${e.num}`}
                className="no-underline"
                aria-label={`${e.num} — ${e.label}`}
              >
                <strong
                  className={`text-[15px] [font-family:var(--font-heading)]${e.num === "112" ? " kfoot-sos" : ""}`}
                >
                  {e.num}
                </strong>{" "}
                — {e.label}
              </a>
            ))}
            <a href={trustHref}>
              {footer.trustLine}: {trustPhone}
            </a>
          </div>
        </div>

        <div>
          <h2 className="mb-3 kicker-heading" style={{ color: muted(72) }}>
            {footer.resourcesTitle}
          </h2>
          <div className="flex flex-col gap-2">
            {footer.resources.map((r) =>
              r.external ? (
                <a key={r.label} href={r.href} target="_blank" rel="noopener">
                  {r.label}
                </a>
              ) : (
                <Link key={r.label} href={r.href}>
                  {r.label}
                </Link>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="kfoot-legal border-t border-[var(--color-divider)]">
        <div
          className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center gap-4 px-6 py-[14px] text-xs max-[920px]:px-4"
          style={{ color: muted(70) }}
        >
          <span>{copyright}</span>
          <span className="flex-1" />
          {footer.legal.map((l) => (
            <Link key={l.label} href={l.href}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
