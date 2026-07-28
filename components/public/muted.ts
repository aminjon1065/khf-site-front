/** color-mix помощник для приглушённого текста поверх --color-text. */
export const muted = (pct: number) => {
  const accessiblePercentage = Math.min(100, Math.max(70, pct));

  return `color-mix(in srgb,var(--color-text) ${accessiblePercentage}%,transparent)`;
};
