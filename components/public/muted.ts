/** color-mix помощник для приглушённого текста поверх --color-text. */
export const muted = (pct: number) =>
  `color-mix(in srgb,var(--color-text) ${pct}%,transparent)`;
