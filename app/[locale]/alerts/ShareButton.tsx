"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

/**
 * Кнопка «Поделиться»: копирует адрес страницы в буфер обмена и на 2 секунды
 * показывает подтверждение. Изолированный клиентский компонент — остальная
 * страница остаётся серверной.
 */
export default function ShareButton({
  idle,
  copied,
}: {
  idle: string;
  copied: string;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const onShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={onShare}
      aria-live="polite"
      className="btn btn-secondary text-[12.5px]"
    >
      <Share2 size={14} strokeWidth={1.5} aria-hidden="true" />
      {isCopied ? copied : idle}
    </button>
  );
}
