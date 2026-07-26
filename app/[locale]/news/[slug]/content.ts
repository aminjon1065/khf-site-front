import type { Locale } from "@/lib/i18n/config";

// Типы статьи для детальной страницы /news/[slug]. Сами данные приходят из
// CMS (fetchNewsItem, lib/api.ts) — здесь только форма (Article) и
// локализованные строки интерфейса (getArticleUi), без демо-контента.

export interface ArticleMaterial {
  /** короткий тип файла — рендерится как tag-neutral (PDF, DOCX …) */
  tag: string;
  title: string;
  size: string; // «0,2 МБ»
  href: string;
}

export interface RelatedArticle {
  kicker: string; // «Международное · 16.07»
  title: string;
  href: string;
}

/** Блок тела статьи: обычный абзац или выделенная цитата. */
export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "quote"; text: string };

export interface Article {
  breadcrumb: string; // короткая подпись для хлебных крошек
  kicker: string; // надзаголовок: рубрика · источник
  title: string;
  lead: string; // лид-абзац
  datetime: string; // «17 июля 2026, 11:40»
  source: string; // «Пресс-центр КЧС»
  photoLabel: string; // подпись-плейсхолдер для ImageSlot
  caption: string; // подпись под фото
  blocks: ArticleBlock[];
  materials: ArticleMaterial[];
  related: RelatedArticle[];
}

// Общие строки интерфейса статьи. Локаль RU — канонический контент портала.
interface ArticleUi {
  materialsTitle: string;
  relatedTitle: string;
  sourceBoxTitle: string;
  sourceBoxText: string;
  share: string;
  shared: string;
  print: string;
  photoCaptionSource: string;
}

const ru: ArticleUi = {
  materialsTitle: "Материалы",
  relatedTitle: "Читайте также",
  sourceBoxTitle: "Официальный источник",
  sourceBoxText:
    "Материал подготовлен пресс-службой КЧС. При использовании ссылка на khf.tj обязательна.",
  share: "Поделиться",
  shared: "Скопировано",
  print: "Версия для печати",
  photoCaptionSource: "Фото: пресс-служба КЧС",
};

const tj: ArticleUi = {
  materialsTitle: "Маводҳо",
  relatedTitle: "Инчунин хонед",
  sourceBoxTitle: "Манбаи расмӣ",
  sourceBoxText:
    "Мавод аз ҷониби хадамоти матбуоти КҲФ омода шудааст. Ҳангоми истифода истинод ба khf.tj ҳатмист.",
  share: "Мубодила",
  shared: "Нусхабардорӣ шуд",
  print: "Нусхаи чопӣ",
  photoCaptionSource: "Акс: хадамоти матбуоти КҲФ",
};

const en: ArticleUi = {
  materialsTitle: "Materials",
  relatedTitle: "Related",
  sourceBoxTitle: "Official source",
  sourceBoxText:
    "This material was prepared by the CoES press office. A link to khf.tj is required when used.",
  share: "Share",
  shared: "Copied",
  print: "Print version",
  photoCaptionSource: "Photo: CoES press office",
};

/** Строки интерфейса статьи для активной локали. */
export function getArticleUi(locale: Locale): ArticleUi {
  return { ru, tj, en }[locale];
}
