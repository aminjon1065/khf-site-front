/**
 * color-mix помощник для приглушённого текста поверх --color-text.
 * Приведено к минимум 65% — ниже этого порога результат не проходит WCAG AA
 * 4.5:1 ни на одном из используемых в проекте фонов (--color-bg/--color-surface
 * и светлее в light-теме — см. tests/e2e/a11y.spec.ts). Верхняя граница 100%
 * защищает от случайных значений больше 100 у вызывающей стороны.
 */
export const muted = (pct: number) =>
  `color-mix(in srgb,var(--color-text) ${Math.min(100, Math.max(pct, 65))}%,transparent)`;
