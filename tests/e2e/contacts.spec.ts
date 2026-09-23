import { expect, test } from "@playwright/test";

// Верхние карточки /contacts — из настроек CMS (org.trust_phone, org.address,
// org.email), как шапка и подвал. Раньше они были зашиты в content.ts, и
// правка телефона доверия в CMS на эту страницу не попадала. Без CMS —
// встроенный текст (graceful-degradation.spec.ts). Значения — settings
// мок-CMS (tests/fixtures/cms-server.mjs).

test("/ru/contacts: телефон доверия, адрес и e-mail — из настроек CMS", async ({
  page,
}) => {
  await page.goto("/ru/contacts");
  const cards = page.getByRole("region", { name: "Экстренная помощь" });

  await expect(
    cards.getByRole("link", { name: "+992 00 000 00 00", exact: true }),
  ).toHaveAttribute("href", "tel:+992000000000");
  await expect(cards).toContainText("Душанбе, Таджикистан");
  await expect(
    cards.getByRole("link", { name: "info@example.test", exact: true }),
  ).toHaveAttribute("href", "mailto:info@example.test");

  // Встроенные значения уступили настройкам…
  await expect(cards).not.toContainText("+992 (37) 221-59-00");
  await expect(cards).not.toContainText("ул. Лохути, 26");
  await expect(cards).not.toContainText("info@khf.tj");
  // …а 112 и часы приёма по-прежнему принадлежат странице.
  await expect(
    cards.getByRole("link", { name: "112", exact: true }),
  ).toHaveAttribute("href", "tel:112");
  await expect(cards).toContainText("пн–пт, 08:00–17:00");
});

test("/en/contacts: адрес — из настроек на языке страницы", async ({ page }) => {
  await page.goto("/en/contacts");
  const cards = page.getByRole("region", { name: "Emergency assistance" });

  await expect(cards).toContainText("Dushanbe, Tajikistan");
  await expect(cards).not.toContainText("26 Lohuti St.");
  await expect(cards).toContainText("Mon–Fri, 08:00–17:00");
});
