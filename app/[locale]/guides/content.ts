import type { Locale } from "@/lib/i18n/config";

// Контент страницы «Безопасность населения» (каталог инструкций). Карточки и
// каталог приходят из CMS; здесь — только текст шапки, локализованный для ru/tj/en
// через getGuidesContent(locale).

interface GuidesContent {
  hero: { title: string; lead: string };
  emergency: { number: string; text: string };
  priorityCta: string;
}

const ru: GuidesContent = {
  hero: {
    title: "Безопасность населения",
    lead: "Пошаговые инструкции, как действовать до, во время и после чрезвычайных ситуаций. Изучите их заранее — в момент опасности времени на чтение не будет.",
  },
  emergency: {
    number: "112",
    text: "Единый номер экстренных служб. Звонок бесплатный, работает без SIM-карты.",
  },
  priorityCta: "Открыть инструкцию →",
};

const tj: GuidesContent = {
  hero: {
    title: "Бехатарии аҳолӣ",
    lead: "Дастурҳои қадам ба қадам оид ба он ки пеш, ҳангом ва пас аз ҳолатҳои фавқулода чӣ гуна амал кардан лозим аст. Онҳоро пешакӣ омӯзед — дар лаҳзаи хатар вақт барои хондан намемонад.",
  },
  emergency: {
    number: "112",
    text: "Рақами ягонаи хидматҳои фавқулодда. Занг ройгон аст ва бе SIM-корт кор мекунад.",
  },
  priorityCta: "Кушодани дастур →",
};

const en: GuidesContent = {
  hero: {
    title: "Public safety",
    lead: "Step-by-step instructions on how to act before, during and after emergencies. Learn them in advance — in a moment of danger there will be no time to read.",
  },
  emergency: {
    number: "112",
    text: "The single number for emergency services. The call is free and works without a SIM card.",
  },
  priorityCta: "Open the guide →",
};

/** Текст шапки страницы «Безопасность» для активной локали. */
export function getGuidesContent(locale: Locale): GuidesContent {
  return { ru, tj, en }[locale];
}

/** Порядковый номер темы с ведущим нулём: 01, 02 … */
export const topicNum = (i: number) => String(i + 1).padStart(2, "0");
