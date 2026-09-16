/**
 * «Поделиться» материалом.
 *
 * Раньше обе кнопки портала просто клали адрес в буфер обмена и писали
 * «скопировано». Это не то, что обещает подпись: человек ждёт системного окна
 * выбора — отправить в мессенджер, почту, заметки. Копирование остаётся
 * запасным путём там, где Web Share недоступен (десктопные браузеры без
 * поддержки, http-origin: `navigator.share` требует защищённого контекста).
 *
 * Отмена системного окна — не ошибка: подменять её копированием нельзя, иначе
 * закрытие окна выглядело бы как «всё равно что-то сделали».
 */
export type ShareOutcome = "shared" | "copied" | "cancelled" | "failed";

export interface SharePayload {
  title: string;
  text?: string;
  url: string;
}

export async function shareOrCopy(payload: SharePayload): Promise<ShareOutcome> {
  if (typeof navigator === "undefined") {
    return "failed";
  }

  if (typeof navigator.share === "function") {
    try {
      await navigator.share(payload);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
      // NotAllowedError и прочее — уходим на копирование ниже: кнопка должна
      // сделать хоть что-то полезное, а не промолчать.
    }
  }

  try {
    await navigator.clipboard.writeText(payload.url);
    return "copied";
  } catch {
    return "failed";
  }
}
