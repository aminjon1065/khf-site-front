import Link from "next/link";
import { common } from "@/lib/copy/common";
import { muted } from "@/components/public/ui";
import type { ApiMenuItem, ApiSettings } from "@/lib/api";

const { footer, header } = common;

/**
 * Общий подвал портала. Реквизиты, контакты, экстренные номера и меню приходят
 * из CMS (settings/menu) с фолбэком на статические строки.
 */
export default function PublicFooter({
  settings,
  footerMenu,
}: {
  settings?: ApiSettings | null;
  footerMenu?: ApiMenuItem[];
}) {
  const orgTitle = settings?.org.short_name || footer.orgTitle;
  const about = settings?.org.about || footer.about;
  const address = settings?.org.address || footer.address[0];
  const email = settings?.org.email || footer.address[1];

  const sections =
    footerMenu && footerMenu.length > 0
      ? footerMenu.map((m) => ({ label: m.label, href: m.url ?? "#" }))
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
    <footer className="kfoot mt-16 border-t border-[var(--color-divider)]">
      <div className="mx-auto grid w-full max-w-[1160px] grid-cols-[minmax(240px,1.3fr)_repeat(3,minmax(160px,1fr))] gap-8 px-6 pb-7 pt-10 max-[920px]:grid-cols-2 max-[920px]:px-4 max-[560px]:grid-cols-1">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo-kchs-ru.webp" alt="" className="h-11 w-auto" />
            <span className="text-[15px] font-semibold uppercase leading-tight [font-family:var(--font-heading)]">
              {orgTitle}
            </span>
          </div>
          <p className="m-0 text-[13px] leading-[1.55]" style={{ color: muted(62) }}>
            {about}
          </p>
          <p className="m-0 text-xs" style={{ color: muted(50) }}>
            {address}
            <br />
            {email}
          </p>
          {socialEntries.length > 0 && (
            <div className="flex flex-wrap gap-3 text-[12.5px]">
              {socialEntries.map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noopener" className="capitalize">
                  {k}
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h6 className="mb-3" style={{ color: muted(55) }}>
            {footer.sectionsTitle}
          </h6>
          <div className="flex flex-col gap-2">
            {sections.map((s) => (
              <Link key={s.label} href={s.href}>
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h6 className="mb-3" style={{ color: muted(55) }}>
            {footer.emergencyTitle}
          </h6>
          <div className="flex flex-col gap-2 text-[13px]">
            {emergency.map((e) => (
              <span key={e.num}>
                <strong className="text-[15px] [font-family:var(--font-heading)]">
                  {e.num}
                </strong>{" "}
                — {e.label}
              </span>
            ))}
            <a href={trustHref}>Телефон доверия: {trustPhone}</a>
          </div>
        </div>

        <div>
          <h6 className="mb-3" style={{ color: muted(55) }}>
            {footer.resourcesTitle}
          </h6>
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

      <div className="border-t border-[var(--color-divider)]">
        <div
          className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center gap-4 px-6 py-[14px] text-xs max-[920px]:px-4"
          style={{ color: muted(50) }}
        >
          <span>{copyright}</span>
          <span className="flex-1" />
          {footer.legal.map((l) => (
            <Link key={l.label} href={l.href}>
              {l.label}
            </Link>
          ))}
          <span>{footer.updated}</span>
        </div>
      </div>
    </footer>
  );
}
