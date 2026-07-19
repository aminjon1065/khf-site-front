"use client";

import { useState } from "react";

/**
 * Клиентские действия в мета-строке статьи: «Поделиться» (копирует ссылку в
 * буфер обмена и на 2 секунды меняет подпись) и «Версия для печати».
 */
export default function ArticleActions({
  shareLabel,
  sharedLabel,
  printLabel,
}: {
  shareLabel: string;
  sharedLabel: string;
  printLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  function onShare() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost text-[12.5px]"
        onClick={onShare}
        aria-live="polite"
      >
        {copied ? sharedLabel : shareLabel}
      </button>
      <button
        type="button"
        className="btn btn-ghost text-[12.5px]"
        onClick={() => window.print()}
      >
        {printLabel}
      </button>
    </>
  );
}
