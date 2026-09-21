import { TriangleAlert } from "lucide-react";
import Link from "@/components/i18n/LocaleLink";
import { routes } from "@/lib/routes";
import { muted } from "@/components/public/ui";
import type { ApiAlert } from "@/lib/api";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

/**
 * Верхний баннер обстановки — состояние приходит из CMS.
 *
 * `unavailable` не приходит из CMS: так страница помечает, что запрос за
 * обстановкой не удался. Без этого признака отказ бэкенда выглядел как
 * подтверждённое спокойствие — худшая из возможных ошибок для портала,
 * по которому люди судят о наличии угрозы.
 */
export default function AlertBanner({
  state,
  top,
  copy,
}: {
  state: "calm" | "warning" | "critical" | "unavailable";
  top?: ApiAlert;
  copy: Dictionary["home"];
}) {
  if (state === "unavailable") {
    const u = copy.unavailable;
    return (
      <section
        aria-label={u.aria}
        aria-live="polite"
        className="border-b border-[var(--color-divider)]"
        style={{ background: "var(--hz-warning-bg)" }}
      >
        <div className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center gap-2.5 px-6 py-2.5 text-[13px] max-[920px]:px-4">
          <TriangleAlert
            size={17}
            strokeWidth={1.5}
            aria-hidden="true"
            style={{ color: "var(--hz-warning)", flex: "none" }}
          />
          <span>
            <strong>{u.strong}</strong>
            {u.text}
          </span>
          <span className="flex-1" />
          <a href="tel:112" style={{ color: "var(--color-accent-700)" }}>
            {u.call112}
          </a>
        </div>
      </section>
    );
  }
  if (state === "critical") {
    const c = copy.critical;
    const href = top ? `/alerts/${top.slug}` : routes.alert;
    return (
      <section
        aria-label={copy.banner.criticalAria}
        style={{ background: "var(--hz-critical-solid)", color: "#fff" }}
      >
        <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-[14px] px-6 py-7 max-[920px]:px-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="crit-dot h-3 w-3 rounded-full"
              style={{ background: "#fff" }}
            />
            <span className="text-[11px] font-bold uppercase tracking-[.12em]">
              {top?.level_label ?? c.kicker}
            </span>
            {top?.datetime && (
              <span className="text-xs opacity-85">{top.datetime}</span>
            )}
          </div>
          {/* Не h1: у страницы уже есть единственный локализованный h1
              (название портала, sr-only). Второй h1 ломал бы структуру
              документа; визуальный приоритет предупреждения сохранён тем же
              кеглем и гарнитурой заголовка. */}
          <p
            className="m-0 text-[34px] font-semibold leading-[1.12] [font-family:var(--font-heading)]"
            style={{ color: "#fff" }}
          >
            {top?.title ?? c.title}
          </p>
          <p className="m-0 max-w-[760px] text-base leading-[1.5]">
            {top?.summary ?? c.text}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={routes.guides}
              className="btn px-5 py-2.5 text-[15px]"
              style={{
                background: "#fff",
                color: "var(--hz-critical-solid)",
                borderColor: "#fff",
              }}
            >
              {copy.banner.whatToDo}
            </Link>
            <Link
              href={href}
              className="btn px-5 py-2.5 text-[15px]"
              style={{ color: "#fff", borderColor: "rgba(255,255,255,.6)" }}
            >
              {copy.banner.detailsMap}
            </Link>
            <a
              href="tel:112"
              className="btn px-5 py-2.5 text-[15px]"
              style={{ color: "#fff", borderColor: "rgba(255,255,255,.6)" }}
            >
              {copy.banner.call112}
            </a>
          </div>
        </div>
      </section>
    );
  }
  if (state === "warning") {
    const w = copy.warning;
    const href = top ? `/alerts/${top.slug}` : routes.alert;
    return (
      <section
        aria-label={copy.banner.warningAria}
        className="border-b border-[var(--color-divider)]"
        style={{ background: "var(--hz-warning-bg)" }}
      >
        <div className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center gap-[14px] px-6 py-[14px] max-[920px]:px-4">
          <TriangleAlert
            size={20}
            strokeWidth={1.5}
            aria-hidden="true"
            style={{ color: "var(--hz-warning)", flex: "none" }}
          />
          <span
            className="tag font-bold uppercase tracking-[.08em]"
            style={{
              background: "var(--hz-warning)",
              color: "var(--color-bg)",
            }}
          >
            {top?.level_label ?? w.levelLabel}
          </span>
          <span className="min-w-[260px] flex-1 text-sm">
            <strong>{top?.title ?? w.strong}</strong>
            {top ? "" : w.text}
          </span>
          {(top?.datetime ?? w.time) && (
            <span className="text-xs" style={{ color: muted(55) }}>
              {top?.datetime ?? w.time}
            </span>
          )}
          <Link href={href} className="btn btn-secondary text-[13px]">
            {w.more}
          </Link>
        </div>
      </section>
    );
  }
  const c = copy.calm;
  return (
    <section
      aria-label={copy.banner.calmAria}
      className="status-calm border-b border-[var(--color-divider)]"
    >
      {/* Только статус: сводка по регионам и ссылка на карту — в блоке
          «Оперативная сводка» ниже. Раньше обе полосы дублировали друг друга
          и словами, и ссылкой. */}
      <div className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center gap-2.5 px-6 py-2.5 text-sm max-[920px]:px-4">
        <span
          className="h-[9px] w-[9px] rounded-full"
          style={{ background: "var(--hz-success)" }}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <strong>{c.strong}</strong>
          {c.text}
        </span>
      </div>
    </section>
  );
}
