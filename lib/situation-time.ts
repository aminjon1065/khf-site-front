import { htmlLang, type Locale } from "@/lib/i18n/config";

// «На какой момент сведения актуальны» — время из CMS (`alerts.updated_at`):
// когда она сверила состояние предупреждений. Это не время ответа API и не
// время рендера (страница отдаётся из ISR-кэша), поэтому выводится как есть,
// в поясе Душанбе с явной пометкой, чтобы посетитель в другом поясе не принял
// его за своё местное.

const TIME_ZONE = "Asia/Dushanbe";

/**
 * Срок, после которого сведения считаются устаревшими, если настройки CMS
 * не пришли: тот же, что по умолчанию в CMS (App\\Support\\SituationFreshness).
 */
export const DEFAULT_STALE_AFTER_MINUTES = 1440;

export interface SituationTime {
  /** Значение для атрибута `datetime` элемента `<time>`. */
  dateTime: string;
  /** «09:42 (UTC+5)» сегодня, «16 сентября, 09:15 (UTC+5)» — в другой день. */
  text: string;
}

function dayInDushanbe(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Время актуальности обстановки для подписи сводки; `null`, если CMS его не
 * прислала или прислала нечитаемое — тогда подпись не выводится, а не
 * подменяется выдуманным временем.
 */
export function situationTime(
  iso: string | null | undefined,
  locale: Locale,
  now: Date = new Date(),
): SituationTime | null {
  if (!iso) {
    return null;
  }

  const at = new Date(iso);

  if (Number.isNaN(at.getTime())) {
    return null;
  }

  const lang = htmlLang(locale);
  const time = new Intl.DateTimeFormat(lang, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIME_ZONE,
  }).format(at);
  // Дата и время собираются по отдельности: как ICU склеивает их вместе
  // («15 сентября в 23:50»), зависит от его версии.
  const date =
    dayInDushanbe(at) === dayInDushanbe(now)
      ? null
      : new Intl.DateTimeFormat(lang, {
          day: "numeric",
          month: "long",
          timeZone: TIME_ZONE,
        }).format(at);

  return {
    dateTime: iso,
    text: `${date ? `${date}, ` : ""}${time} (UTC+5)`,
  };
}

/**
 * Старше ли сведения допустимого срока — на момент, когда страницу читают,
 * а не когда её собрали: страница отдаётся из ISR-кэша, и «сейчас» знает
 * только браузер. Срок задаёт администратор CMS (settings.situation,
 * по умолчанию сутки). Нечитаемое время устаревшим не объявляем — подпись
 * о нём и так не выводится (situationTime).
 */
export function isOutdated(
  iso: string | null | undefined,
  staleAfterMinutes: number,
  nowMs: number,
): boolean {
  if (!iso) {
    return false;
  }

  const at = new Date(iso).getTime();

  if (Number.isNaN(at)) {
    return false;
  }

  return nowMs - at > staleAfterMinutes * 60_000;
}
