"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
import { isOutdated } from "@/lib/situation-time";

const MINUTE_MS = 60_000;

function everyMinute(onTick: () => void): () => void {
  const timer = window.setInterval(onTick, MINUTE_MS);

  return () => window.clearInterval(timer);
}

/**
 * На какой момент известна обстановка — и предупреждение, если это было
 * давно (аудит A-2).
 *
 * Время готовит сервер (situationTime), а «давно ли» решает браузер:
 * страница отдаётся из ISR-кэша, и только он знает, когда её читают. Срок
 * выбирает администратор CMS (settings.situation.stale_after_minutes, по
 * умолчанию сутки). На сервере предупреждения нет — поэтому и гидратация не
 * расходится; без JS остаётся одно время. Появившееся предупреждение —
 * role="status": программа экранного доступа его прочитает.
 */
export default function SituationAsOf({
  label,
  dateTime,
  text,
  staleAfterMinutes,
  outdatedText,
  className,
  style,
}: {
  /** «Обстановка на» на языке страницы. */
  label: string;
  /** ISO-время сверки CMS — для `<time datetime>` и проверки возраста. */
  dateTime: string;
  /** «09:42 (UTC+5)» / «16 сентября, 09:15 (UTC+5)». */
  text: string;
  staleAfterMinutes: number;
  outdatedText: string;
  className?: string;
  style?: CSSProperties;
}) {
  const outdated = useSyncExternalStore(
    everyMinute,
    () => isOutdated(dateTime, staleAfterMinutes, Date.now()),
    () => false,
  );

  return (
    <>
      <span className={className} style={style}>
        {label} <time dateTime={dateTime}>{text}</time>
      </span>
      {outdated && (
        <span
          role="status"
          className="text-[13px]"
          style={{ color: "var(--hz-warning)" }}
        >
          {outdatedText}
        </span>
      )}
    </>
  );
}
