/**
 * Маркер фотогалереи в теле материала. Редактор CMS ставит его в
 * произвольное место текста (TipTap-узел), в HTML он сериализуется как
 * `<figure class="cms-gallery">…</figure>` и проходит санитайзер CMS.
 *
 * Здесь тело статьи разрезается по маркерам: карусель рендерится на месте
 * первого, остальные (задублированные редактором) тихо убираются. Без
 * кадров (gallery < 2 снимков) все маркеры просто вырезаются — читатель
 * не должен видеть пустую карусель или технический текст.
 */

// Класс маркера совпадает с rich-gallery.ts в CMS (figure[class] — максимум,
// что разрешает профиль санитайзера 'news' для figure).
const GALLERY_MARK =
  /<figure[^>]*class="[^"]*\bcms-gallery\b[^"]*"[^>]*>[\s\S]*?<\/figure>/gi;

/** Есть ли в теле маркер галереи (до вырезания). */
export function hasGalleryMark(html: string): boolean {
  GALLERY_MARK.lastIndex = 0;
  return GALLERY_MARK.test(html);
}

/**
 * Части тела вокруг ПЕРВОГО маркера: [до, после]. Маркеры после первого
 * удаляются из обеих частей. Если маркера нет — весь HTML одной частью.
 */
export function splitBodyByGallery(html: string): [string, string] {
  GALLERY_MARK.lastIndex = 0;
  const match = GALLERY_MARK.exec(html);

  if (!match) {
    return [html, ""];
  }

  const before = html.slice(0, match.index);
  const after = html
    .slice(match.index + match[0].length)
    .replace(GALLERY_MARK, "");

  return [before, after];
}

/** Тело без маркеров — для трассы без карусели (старые материалы, plain-текст). */
export function stripGalleryMarks(html: string): string {
  return html.replace(GALLERY_MARK, "");
}
