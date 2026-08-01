"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Поведение раскрывающихся меню шапки, которого нет у нативных элементов.
 *
 * 1. Закрытие при переходе. Пока шапку рисовала каждая страница, она
 *    перемонтировалась на каждом переходе и открытый `<details>` сбрасывался
 *    сам собой. После переноса оболочки в layout шапка живёт дальше вместе со
 *    своим состоянием — и список оставался раскрытым уже поверх новой страницы.
 *
 * 2. Закрытие по клику мимо и по Escape. `<details>` по спецификации
 *    переключается только своим `<summary>`: клик в любое другое место его не
 *    закрывает, Escape тоже. Для раскрывающегося пункта меню это неверно —
 *    пользователь ждёт поведения выпадающего списка.
 *
 * Состояние `<details>`/`<dialog>` живёт в самом DOM, а не в React, поэтому и
 * управляем им напрямую — это ровно тот случай «синхронизации с внешней
 * системой», для которого нужен эффект.
 */

/** Закрыть всё раскрытое в области (используется при переходе на другую страницу). */
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

/**
 * Закрыть раскрытые списки, внутри которых НЕ находится точка клика.
 *
 * Тот список, по которому кликнули, не трогаем: иначе клик по его же
 * `<summary>` сначала закрыл бы список здесь, а потом нативный обработчик
 * открыл бы его заново — пункт меню перестал бы закрываться вовсе. По этой же
 * причине клик по соседнему заголовку корректно закрывает первый список.
 *
 * @returns сколько списков закрыто (для тестов и отладки)
 */
export function closeDetailsOutside(scope: ParentNode, target: Node | null): number {
  let closed = 0;

  for (const details of scope.querySelectorAll("details[open]")) {
    if (target && details.contains(target)) {
      continue;
    }

    details.removeAttribute("open");
    closed += 1;
  }

  return closed;
}

/** Закрыть раскрытые списки и вернуть фокус на заголовок последнего из них. */
export function closeDetailsOnEscape(scope: ParentNode): boolean {
  const open = [...scope.querySelectorAll("details[open]")];

  if (open.length === 0) {
    return false;
  }

  for (const details of open) {
    details.removeAttribute("open");
  }

  const summary = open[open.length - 1].querySelector("summary");

  if (summary instanceof HTMLElement) {
    summary.focus();
  }

  return true;
}

export default function HeaderOverlays({
  /** Куда смотреть. По умолчанию — только шапка, контент страницы не трогаем. */
  scopeSelector = "header",
}: {
  scopeSelector?: string;
}) {
  const pathname = usePathname();

  // Переход на другую страницу.
  useEffect(() => {
    const scope = document.querySelector(scopeSelector);

    if (scope) {
      closeOverlaysIn(scope);
    }
  }, [pathname, scopeSelector]);

  // Клик мимо и Escape.
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const scope = document.querySelector(scopeSelector);

      if (scope) {
        closeDetailsOutside(scope, event.target as Node | null);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      const scope = document.querySelector(scopeSelector);

      if (scope) {
        closeDetailsOnEscape(scope);
      }
    };

    // `pointerdown`, а не `click`: список должен закрываться сразу по нажатию,
    // до того как клик по ссылке начнёт переход.
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [scopeSelector]);

  return null;
}
