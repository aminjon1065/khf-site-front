import { describe, expect, it } from "vitest";
import {
  getContacts,
  withContactSettings,
} from "@/app/[locale]/contacts/content";

// Верхние карточки /contacts: телефон доверия, адрес и e-mail центрального
// аппарата — из настроек CMS, при пустом или непригодном значении —
// встроенный текст страницы.
const ru = getContacts("ru").emergency;

describe("withContactSettings", () => {
  it("подставляет телефон доверия, адрес и e-mail из настроек CMS", () => {
    const cards = withContactSettings(ru, {
      trust_phone: " +992 (37) 000-11-22 ",
      address: " 734000, г. Душанбе, пр. Рудаки, 1 ",
      email: " office@khf.tj ",
    });

    expect(cards.trust).toEqual({
      ...ru.trust,
      phone: "+992 (37) 000-11-22",
      phoneHref: "tel:+992370001122",
    });
    expect(cards.hq).toEqual({
      ...ru.hq,
      address: "734000, г. Душанбе, пр. Рудаки, 1",
      email: "office@khf.tj",
      emailHref: "mailto:office@khf.tj",
    });
    // 112 и часы приёма — не настройки CMS.
    expect(cards.critical).toEqual(ru.critical);
    expect(cards.hq.hours).toBe(ru.hq.hours);
  });

  it("без настроек (CMS не ответила) оставляет встроенные карточки", () => {
    expect(withContactSettings(ru, null)).toEqual(ru);
    expect(withContactSettings(ru, undefined)).toEqual(ru);
  });

  it("пустое поле заменяется встроенным, остальные берутся из CMS", () => {
    const cards = withContactSettings(ru, {
      trust_phone: "",
      address: "   ",
      email: "press@khf.tj",
    });

    expect(cards.trust).toEqual(ru.trust);
    expect(cards.hq.address).toBe(ru.hq.address);
    expect(cards.hq.email).toBe("press@khf.tj");
  });

  it("не ставит в карточку телефон без цифр и e-mail без «@»", () => {
    const cards = withContactSettings(ru, {
      trust_phone: "уточняется",
      email: "info at khf.tj",
    });

    expect(cards.trust).toEqual(ru.trust);
    expect(cards.hq.email).toBe(ru.hq.email);
    expect(cards.hq.emailHref).toBe(ru.hq.emailHref);
  });

  it("запасной текст — на языке страницы", () => {
    const en = getContacts("en").emergency;

    expect(withContactSettings(en, { address: "" }).hq.address).toBe(
      en.hq.address,
    );
  });
});
