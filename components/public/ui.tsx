import Link from "@/components/i18n/LocaleLink";
import type { CSSProperties, ReactNode } from "react";

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

/**
 * Заголовок секции с нижней линией. Уровень задавайте явно (`as`): основные
 * секции страницы — h2, вложенные — h3. Визуальный размер одинаковый —
 * семантика не должна зависеть от кегля (WCAG: заголовки описывают структуру,
 * а не оформление).
 */
export function SectionHeader({
  title,
  as = "h3",
  link,
  right,
  id,
}: {
  title: string;
  as?: "h2" | "h3";
  link?: { label: string; href: string };
  right?: ReactNode;
  id?: string;
}) {
  const Heading = as;
  return (
    <div
      id={id}
      className="section-head mb-5 flex items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-[10px] max-[560px]:flex-wrap max-[560px]:gap-x-3 max-[560px]:gap-y-2"
    >
      <Heading className="m-0 min-w-0 text-2xl tracking-[.01em]">{title}</Heading>
      <span className="flex-1 max-[560px]:hidden" />
      {link && (
        <Link
          href={link.href}
          className="section-link text-[13px] max-[560px]:ml-auto"
          style={{ color: "var(--color-accent-700)" }}
        >
          {link.label}
        </Link>
      )}
      {right}
    </div>
  );
}
