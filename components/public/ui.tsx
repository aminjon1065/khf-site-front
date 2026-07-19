import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ImageIcon } from "lucide-react";

/** color-mix помощник для приглушённого текста поверх --color-text. */
export const muted = (pct: number) =>
  `color-mix(in srgb,var(--color-text) ${pct}%,transparent)`;

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

/** Хлебные крошки. Последний элемент без href — текущая страница. */
export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav
      aria-label="Хлебные крошки"
      className="mb-4 flex items-center gap-2 text-[12.5px]"
      style={{ color: muted(55) }}
    >
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-2">
            {last ? (
              // Текущая страница: полный цвет + aria-current (только последний).
              <span aria-current="page" style={{ color: "var(--color-text)" }}>
                {it.label}
              </span>
            ) : it.href ? (
              <Link
                href={it.href}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {it.label}
              </Link>
            ) : (
              // Промежуточная крошка без ссылки (напр. «О нас») — приглушённая.
              <span>{it.label}</span>
            )}
            {!last && <span aria-hidden="true">/</span>}
          </span>
        );
      })}
    </nav>
  );
}

/**
 * Слот изображения. С `src` — реальное фото (object-fit),
 * без него — подпись-плейсхолдер (заменяется фото пресс-службы).
 * Duotone-фильтр применяется классом-обёрткой `.duotone` у родителя.
 */
export function ImageSlot({
  src,
  alt,
  label,
  fit = "cover",
  className = "",
  style,
}: {
  src?: string;
  alt?: string;
  label?: string;
  fit?: "cover" | "contain";
  className?: string;
  style?: CSSProperties;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? label ?? ""}
        className={className}
        style={{ width: "100%", height: "100%", objectFit: fit, ...style }}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={label ?? "Изображение"}
      className={`flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center ${className}`}
      style={{
        minHeight: "inherit",
        background: "var(--color-neutral-200)",
        color: muted(42),
        ...style,
      }}
    >
      <ImageIcon size={22} strokeWidth={1.5} aria-hidden="true" />
      {label && (
        <span className="text-[11.5px] leading-snug tracking-[.02em]">
          {label}
        </span>
      )}
    </div>
  );
}
