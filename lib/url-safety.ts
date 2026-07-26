// Проверка ссылок, которые приходят из CMS и рендерятся как кликабельный
// внешний href (напр. application_url объявления). Разрешены только http(s) —
// javascript:/data:/иные схемы отклоняются, даже если поле в CMS не прошло
// валидацию на бэкенде.

/** true, если строка — валидный абсолютный http(s) URL. */
export function isSafeExternalUrl(url: string | null | undefined): url is string {
  if (!url) {
    return false;
  }
  try {
    return ["http:", "https:"].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}
