"use client";

import { Search } from "lucide-react";

/**
 * Кнопка поиска в строке навигации: открывает модальное окно с формой.
 *
 * Почему модалка, а не поле прямо в строке. Раскрывающееся поле отнимало
 * ширину у пунктов меню: при каждом фокусе навигация перестраивалась, пункты
 * прыгали и могли уехать под обрез. Модальное окно не трогает строку вовсе —
 * и заодно даёт полю нормальную ширину вместо 136 px, в которых не виден
 * собственный запрос.
 *
 * Это ССЫЛКА на страницу поиска, а не `<button>`: без JS клик уводит на
 * `/{locale}/search`, где та же форма с автофокусом, и поиск остаётся рабочим.
 * С JS переход отменяется и открывается диалог. Нативный `<dialog>` сам даёт
 * Escape, ::backdrop, ловушку фокуса и возврат фокуса на эту кнопку при
 * закрытии — поэтому ничего из этого здесь руками не написано.
 */
export default function SearchButton({
  dialogId,
  href,
  label,
  openLabel,
}: {
  dialogId: string;
  /** Адрес страницы поиска — запасной путь без JS. */
  href: string;
  /** Видимая подпись («Поиск»). */
  label: string;
  /** Доступное имя действия («Открыть поиск»). */
  openLabel: string;
}) {
  const open = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Модификаторы и средняя кнопка — обычное поведение ссылки
    // (открыть в новой вкладке), перехватывать его нельзя.
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    const dialog = document.getElementById(dialogId);

    if (!(dialog instanceof HTMLDialogElement) || !dialog.showModal) {
      return; // среда без <dialog> — уходим на страницу поиска
    }

    event.preventDefault();
    dialog.showModal();
    dialog.querySelector<HTMLInputElement>("input[type='search']")?.focus();
  };

  return (
    <a
      href={href}
      onClick={open}
      aria-haspopup="dialog"
      aria-controls={dialogId}
      aria-label={openLabel}
      className="knav-search-btn inline-flex items-center gap-[7px] border border-[var(--color-divider)] px-3 py-1.5 text-[13.5px] [font-family:var(--font-heading)]"
      style={{ color: "var(--color-text)", textDecoration: "none" }}
    >
      <Search size={14} strokeWidth={1.5} aria-hidden="true" />
      <span className="knav-search-label">{label}</span>
    </a>
  );
}
