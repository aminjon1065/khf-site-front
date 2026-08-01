"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Закрывает раскрытые меню шапки при переходе на другую страницу.
 *
 * Пока шапку рисовала каждая страница, она перемонтировалась на каждом
 * переходе, и открытый `<details>` (или модальное мобильное меню) сбрасывался
 * сам собой. После переноса оболочки в layout шапка живёт дальше — вместе со
 * своим состоянием, поэтому выпадающий список оставался раскрытым уже поверх
 * новой страницы.
 *
 * Состояние `<details>`/`<dialog>` живёт в самом DOM, а не в React, поэтому и
 * закрываем его напрямую — это ровно тот случай «синхронизации с внешней
 * системой», для которого нужен эффект.
 */
export function closeOverlaysIn(scope: ParentNode): void {
  for (const details of scope.querySelectorAll("details[open]")) {
    details.removeAttribute("open");
  }

  for (const dialog of scope.querySelectorAll("dialog[open]")) {
    // Проверяем метод, а не класс: у показанного через showModal() диалога
    // снять атрибут мало — нужен close(), он же убирает ::backdrop и
    // возвращает фокус. Но метод есть не везде (старые движки, jsdom в
    // тестах), поэтому оставляем и запасной путь.
    const close = (dialog as Partial<HTMLDialogElement>).close;

    if (typeof close === "function") {
      close.call(dialog);
    } else {
      dialog.removeAttribute("open");
    }
  }
}

export default function CloseOnNavigate({
  /** Куда смотреть. По умолчанию — только шапка, контент страницы не трогаем. */
  scopeSelector = "header",
}: {
  scopeSelector?: string;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const scope = document.querySelector(scopeSelector);

    if (scope) {
      closeOverlaysIn(scope);
    }
  }, [pathname, scopeSelector]);

  return null;
}
