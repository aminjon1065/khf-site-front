import Link from "@/components/i18n/LocaleLink";
import type { CSSProperties, ReactNode } from "react";
import { muted } from "@/components/public/muted";

// Пресентационные примитивы публичной части. `muted` и клиентские
// `Breadcrumbs`/`ImageSlot` (им нужна локаль из URL) живут в отдельных файлах и
// ре-экспортируются отсюда — существующие импорты из "@/components/public/ui"
// продолжают работать без изменений.
export { muted } from "@/components/public/muted";
export { Breadcrumbs } from "@/components/public/Breadcrumbs";
export { ImageSlot } from "@/components/public/ImageSlot";

/** Центрированный контейнер контента: max-width 1160, поля 24 (16 на мобильном). */
export function Container({
  children,
  className = "",
  style,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "section" | "main" | "header" | "footer" | "nav";
}) {
  return (
    <Tag
      className={`mx-auto w-full max-w-[1160px] px-6 max-[920px]:px-4 ${className}`}
      style={style}
    >
      {children}
    </Tag>
  );
}

/** Заголовок секции с нижней линией и нумерацией «01 / Инструкции». */
export function SectionHeader({
  title,
  index,
  link,
  right,
  id,
}: {
  title: string;
  index?: string;
  link?: { label: string; href: string };
  right?: ReactNode;
  id?: string;
}) {
  return (
    <div
      id={id}
      className="mb-5 flex items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-[10px]"
    >
      <h3 className="m-0 text-2xl uppercase tracking-[.02em]">{title}</h3>
      {index && (
        <span className="text-xs" style={{ color: muted(50) }}>
          {index}
        </span>
      )}
      <span className="flex-1" />
      {link && (
        <Link
          href={link.href}
          className="text-[13px]"
          style={{ color: "var(--color-accent-700)" }}
        >
          {link.label}
        </Link>
      )}
      {right}
    </div>
  );
}
