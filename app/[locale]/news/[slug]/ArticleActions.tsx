"use client";

import { useState } from "react";
import { shareOrCopy } from "@/lib/share";

/**
 * Клиентские действия в мета-строке статьи: «Поделиться» и «Версия для печати».
 *
 * «Поделиться» открывает системное окно выбора (Web Share). Там, где его нет,
 * адрес кладётся в буфер обмена, и подпись на 2 секунды сообщает об этом —
 * подтверждение показывается только когда действительно скопировали, а не
 * когда человек закрыл системное окно (см. lib/share.ts).
 */
export default function ArticleActions({
  title,
  excerpt,
  shareLabel,
  sharedLabel,
  printLabel,
}: {
  /** Заголовок материала — попадает в системное окно «Поделиться». */
  title: string;
  /** Лид материала: часть полезной нагрузки при отправке. */
  excerpt?: string;
  shareLabel: string;
  sharedLabel: string;
  printLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const outcome = await shareOrCopy({
      title,
      text: excerpt || undefined,
      url: window.location.href,
    });

    if (outcome !== "copied") {
      return;
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={onShare}
        aria-live="polite"
      >
        {copied ? sharedLabel : shareLabel}
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => window.print()}
      >
        {printLabel}
      </button>
    </>
  );
}
