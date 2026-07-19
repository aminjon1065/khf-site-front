import Link from "next/link";
import { common } from "@/lib/copy/common";
import { muted } from "@/components/public/ui";

const { footer } = common;

/** Общий подвал портала. Порт Footer.dc.html. Сетка 4→2→1 колонки. */
export default function PublicFooter() {
  return (
    <footer
      className="kfoot mt-16 border-t border-[var(--color-divider)]"
    >
      <div className="mx-auto grid w-full max-w-[1160px] grid-cols-[minmax(240px,1.3fr)_repeat(3,minmax(160px,1fr))] gap-8 px-6 pb-7 pt-10 max-[920px]:grid-cols-2 max-[920px]:px-4 max-[560px]:grid-cols-1">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo-kchs-ru.webp"
              alt=""
              className="h-11 w-auto"
            />
            <span className="text-[15px] font-semibold uppercase leading-tight [font-family:var(--font-heading)]">
              {footer.orgTitle}
            </span>
          </div>
          <p
            className="m-0 text-[13px] leading-[1.55]"
            style={{ color: muted(62) }}
          >
            {footer.about}
          </p>
          <p className="m-0 text-xs" style={{ color: muted(50) }}>
            {footer.address[0]}
            <br />
            {footer.address[1]}
          </p>
        </div>

        <div>
          <h6 className="mb-3" style={{ color: muted(55) }}>
            {footer.sectionsTitle}
          </h6>
          <div className="flex flex-col gap-2">
            {footer.sections.map((s) => (
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
            {footer.emergency.map((e) => (
              <span key={e.num}>
                <strong className="text-[15px] [font-family:var(--font-heading)]">
                  {e.num}
                </strong>{" "}
                — {e.label}
              </span>
            ))}
            <a href={common.header.trustPhoneHref}>
              Телефон доверия: {common.header.trustPhone}
            </a>
          </div>
        </div>

        <div>
          <h6 className="mb-3" style={{ color: muted(55) }}>
            {footer.resourcesTitle}
          </h6>
          <div className="flex flex-col gap-2">
            {footer.resources.map((r) =>
              r.external ? (
                <a
                  key={r.label}
                  href={r.href}
                  target="_blank"
                  rel="noopener"
                >
                  {r.label}
                </a>
              ) : (
                <Link key={r.label} href={r.href}>
                  {r.label}
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-divider)]">
        <div
          className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center gap-4 px-6 py-[14px] text-xs max-[920px]:px-4"
          style={{ color: muted(50) }}
        >
          <span>{footer.copyright}</span>
          <span className="flex-1" />
          {footer.legal.map((l) => (
            <a key={l.label} href={l.href}>
              {l.label}
            </a>
          ))}
          <span title="Статистика доступа">{footer.visitsToday}</span>
          <span>{footer.updated}</span>
        </div>
      </div>
    </footer>
  );
}
