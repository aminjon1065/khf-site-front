import Link from "@/components/i18n/LocaleLink";
import { SectionHeader, muted } from "@/components/public/ui";
import { HazardIcon, QuickIcon } from "@/components/public/home/icons";
import { routes } from "@/lib/routes";
import { HOME_BLOCK_MAX_ITEMS } from "@/lib/home-blocks";
import type { ApiInstruction } from "@/lib/api";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

/**
 * Быстрые действия. Инструкции приходят из CMS: и состав, и адреса. Раньше
 * все шесть плиток были зашиты в словарь со слагами earthquake/flood/first-aid,
 * которых в CMS нет — реальные слаги это транслит русских названий, так что
 * каждая плитка вела в 404. Три навигационные плитки ведут в разделы сайта,
 * а не к материалам, и остаются статичными.
 *
 * Первая инструкция — крупной плиткой, следующие две — малыми
 * (HOME_BLOCK_MAX_ITEMS.instructions). Порядок задаёт CMS (приоритетные идут
 * первыми, см. Instruction::scopeOrdered).
 */
export default function QuickActions({
  instructions,
  title,
  home,
  ariaLabel,
}: {
  instructions: ApiInstruction[];
  /** Заголовок блока из CMS или словарный; подпись крупной плитки — своя. */
  title: string;
  home: Dictionary["home"];
  ariaLabel: string;
}) {
  const [leadInstruction, ...restInstructions] = instructions;
  const sideInstructions = restInstructions.slice(
    0,
    HOME_BLOCK_MAX_ITEMS.instructions - 1,
  );

  return (
    <section aria-label={ariaLabel} className="mt-[52px]">
      <SectionHeader
        as="h2"
        title={title}
        link={{ label: home.quickActions.allLink, href: routes.guides }}
      />
      <div className="grid grid-cols-4 grid-rows-[auto_auto] gap-[14px] max-[920px]:grid-cols-2 max-[560px]:grid-cols-1">
        {leadInstruction && (
          <Link
            href={routes.guide(leadInstruction.slug)}
            className="blueprint surface-hover row-span-2 flex flex-col gap-3 p-5 transition-all hover:-translate-y-0.5 max-[560px]:row-span-1"
            style={{
              textDecoration: "none",
              color: "inherit",
              borderTop: "3px solid var(--color-accent)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-surface)] text-[var(--color-accent)]">
                <HazardIcon name={leadInstruction.hazard_icon} size={26} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent-700)]">
                {home.quickActions.title}
              </span>
            </div>
            <span className="text-[20px] font-bold leading-tight text-slate-900 dark:text-white [font-family:var(--font-heading)]">
              {leadInstruction.title}
            </span>
            <span className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
              {leadInstruction.summary}
            </span>
            <span
              className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-accent-700)]"
            >
              <span>{home.quickActions.openInstruction}</span>
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        )}
        {sideInstructions.map((item) => (
          <Link
            key={item.slug}
            href={routes.guide(item.slug)}
            className="blueprint surface-hover flex items-start gap-3 p-4 transition-all hover:-translate-y-0.5"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <span className="quick-ico">
              <HazardIcon name={item.hazard_icon} />
            </span>
            <span>
              <span className="block text-[17px] font-semibold [font-family:var(--font-heading)]">
                {item.title}
              </span>
              <span className="text-[12.5px]" style={{ color: muted(62) }}>
                {item.summary}
              </span>
            </span>
          </Link>
        ))}
        {home.quickActions.links.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="blueprint surface-hover flex items-start gap-3 p-4 transition-all hover:-translate-y-0.5"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <span className="quick-ico">
              <QuickIcon name={s.icon} />
            </span>
            <span>
              <span className="block text-[17px] font-semibold [font-family:var(--font-heading)]">
                {s.title}
              </span>
              <span className="text-[12.5px]" style={{ color: muted(62) }}>
                {s.desc}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
