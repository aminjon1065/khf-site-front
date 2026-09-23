import { muted } from "@/components/public/muted";

/** Новые страницы — HTML из редактора CMS, у старых записей простой текст. */
const HTML_BODY = /<[a-z][\s\S]*>/i;

/** Встроенный контент, который сам по себе не текст, но всё же содержимое. */
const EMBEDDED_CONTENT = /<(img|iframe|video)\b/i;

function paragraphsOf(text: string): string[] {
  return text
    .split(/\n{2,}|\r?\n/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Есть ли в теле CMS-страницы что показать. Пустой редактор сохраняет не
 * пустую строку, а разметку вроде `<p></p>` или `<p>&nbsp;</p>` — такое тело
 * считается пустым, иначе на месте текста остался бы пустой блок, а раздел
 * не перешёл бы на запасной текст.
 */
export function hasCmsBody(body: string | null | undefined): boolean {
  if (!body) {
    return false;
  }
  if (!HTML_BODY.test(body)) {
    return body.trim() !== "";
  }
  if (EMBEDDED_CONTENT.test(body)) {
    return true;
  }

  return (
    body
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;|&#160;|&#xa0;| /gi, " ")
      .trim() !== ""
  );
}

/**
 * Тело CMS-страницы (`Page.body`) — единственное место, которое решает, как
 * его выводить: /pages/[slug], /about и вводные блоки разделов «О нас»
 * (/leadership, /structure, /symbols).
 *
 * HTML санитайзится в CMS при сохранении (HTMLPurifier, профиль mews/purifier)
 * и выводится как есть; простой текст старых записей разбивается на абзацы и
 * экранируется React'ом.
 *
 * `variant="intro"` — лид раздела, а не тело статьи: приглушённый текст
 * обычного кегля (`.article-prose-intro` в globals.css; ширину и кегль
 * уточняет `className`). Подзаголовки h2 внутри лида допустимы: они идут
 * после h1 страницы и до её собственных секций, уровни не перескакивают.
 * Пустое тело лида ничего не рисует — раздел сам решает, чем его заменить.
 */
export default function CmsProse({
  body,
  variant = "article",
  placeholder,
  className,
}: {
  body: string | null | undefined;
  variant?: "article" | "intro";
  /** Текст вместо пустого тела статьи (у лида не используется). */
  placeholder?: string;
  /** Дополнительные классы контейнера лида: ширина, кегль, отступы. */
  className?: string;
}) {
  const text = body ?? "";
  const hasContent = hasCmsBody(text);
  const isHtml = HTML_BODY.test(text);

  if (variant === "intro") {
    if (!hasContent) {
      return null;
    }

    const introClassName = ["article-prose article-prose-intro", className]
      .filter(Boolean)
      .join(" ");
    const introStyle = { color: muted(70) };

    return isHtml ? (
      <div
        className={introClassName}
        style={introStyle}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    ) : (
      <div className={introClassName} style={introStyle}>
        {paragraphsOf(text).map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    );
  }

  if (!hasContent) {
    return placeholder ? (
      <p className="text-[15px] leading-[1.7]" style={{ color: muted(60) }}>
        {placeholder}
      </p>
    ) : null;
  }

  return isHtml ? (
    <div className="article-prose" dangerouslySetInnerHTML={{ __html: text }} />
  ) : (
    paragraphsOf(text).map((paragraph, i) => (
      <p key={i} className="mb-4 text-[15px] leading-[1.7]">
        {paragraph}
      </p>
    ))
  );
}
