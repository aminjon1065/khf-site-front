import type { CSSProperties, ReactNode } from "react";
import type { NavKey } from "@/lib/routes";
import type { Locale } from "@/lib/i18n/config";

/** Ширина и отступы контентной колонки по умолчанию. */
export const DEFAULT_MAIN_CLASS =
  "mx-auto w-full max-w-[1160px] px-6 pt-9 max-[920px]:px-4";

/**
 * Контентная колонка страницы.
 *
 * Раньше этот компонент был всей оболочкой: сам ходил в CMS за настройками и
 * меню, рисовал шапку, `<main>` и подвал. Из-за этого шапка и подвал жили
 * ВНУТРИ страницы: при каждом переходе они размонтировались, перерисовывались и
 * заново запрашивали `/settings` и `/menu`, а скелетон сегмента на время
 * загрузки подменял собой весь экран вместе с меню.
 *
 * Теперь оболочка живёт в `app/[locale]/layout.tsx` и переживает переходы, а
 * здесь остаётся только колонка контента — та часть, которая действительно
 * меняется от страницы к странице. Разметка при этом не изменилась: те же
 * классы, только на `<div>` внутри `<main>`, а не на самом `<main>`.
 *
 * Пропы `active` и `locale` больше не нужны (активный пункт меню шапка
 * определяет по URL, локаль знает layout), но остаются в типе, чтобы не
 * править разом два десятка страниц — они просто игнорируются.
 */
export default function PageShell({
  topSlot,
  children,
  mainClassName = DEFAULT_MAIN_CLASS,
  mainStyle,
}: {
  /** @deprecated активный пункт меню определяется по URL. */
  active?: NavKey;
  /** @deprecated локаль берётся из layout. */
  locale?: Locale;
  /** Полноширинный блок над контентом (статусный баннер главной). */
  topSlot?: ReactNode;
  children: ReactNode;
  mainClassName?: string;
  mainStyle?: CSSProperties;
}) {
  return (
    <>
      {topSlot}
      <div className={mainClassName} style={mainStyle}>
        {children}
      </div>
    </>
  );
}
