// Типы инструкции населению для детальной страницы /guides/[slug]. Сами
// данные приходят из CMS (fetchInstruction, lib/api.ts) и приводятся к этой
// форме в page.tsx (buildSections и т.п.) — здесь только форма, без контента.

/** Фрагмент текста шага: обычная строка либо выделенный жирным зачин. */
export type Run = string | { b: string };

export interface GuideStep {
  n: string;
  text: Run[];
}

/** Тональность блока: accent (До), warning (Во время), success (После). */
export type SectionTone = "accent" | "warning" | "success";

export interface GuideSection {
  aria: string;
  tone: SectionTone;
  tag: string;
  title: string;
  steps: GuideStep[];
}

export interface RelatedLink {
  label: string;
  href: string;
}

export interface GuideContent {
  kicker: string;
  title: string;
  crumbLabel: string;
  summaryTitle: string;
  summary: Run[];
  sections: GuideSection[];
  dontTitle: string;
  dont: string[];
  materialsTitle: string;
  pdf: { label: string; note: string; href: string };
  emergency: { title: string; num: string; note: string; href: string };
  relatedTitle: string;
  related: RelatedLink[];
}
