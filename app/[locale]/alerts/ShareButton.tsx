"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { shareOrCopy } from "@/lib/share";

/**
 * Кнопка «Поделиться» предупреждением: открывает системное окно выбора
 * (Web Share), а там, где его нет, кладёт адрес в буфер обмена и на 2 секунды
 * показывает подтверждение. Для предупреждения это не украшение: переслать
 * его знакомым — обычный сценарий, и копирование ссылки его не заменяет.
 *
 * Изолированный клиентский компонент — остальная страница остаётся серверной.
 */
export default function ShareButton({
  title,
  summary,
  idle,
  copied,
}: {
  /** Заголовок предупреждения — в системное окно «Поделиться». */
  title: string;
  /** Краткое описание: часть полезной нагрузки при отправке. */
  summary?: string;
  idle: string;
  copied: string;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const onShare = async () => {
    const outcome = await shareOrCopy({
      title,
      text: summary || undefined,
      url: window.location.href,
    });

    if (outcome !== "copied") {
      return;
    }

    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={onShare}
      aria-live="polite"
      className="btn btn-secondary btn-sm"
    >
      <Share2 size={14} strokeWidth={1.5} aria-hidden="true" />
      {isCopied ? copied : idle}
    </button>
  );
}
