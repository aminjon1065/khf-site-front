import type { Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/routes";

// Контент лендинга мобильного приложения SOS (заглушка CMS).
// Представление (app/sos/page.tsx) читает только отсюда — строк в JSX нет.
// Текст локализован: getSos(locale) возвращает ru/tj/en.

/** Ссылка на магазин приложений с брендовой иконкой (App Store / Google Play). */
export interface StoreLink {
  href: string;
  label: string;
}

/** Возможность приложения: цвет верхней рамки и иконки задаётся токенами. */
export interface AppFeature {
  icon: "sos" | "bell" | "book";
  borderColor: string;
  iconColor: string;
  title: string;
  desc: string;
}

/** Шаг сценария экстренного вызова. */
export interface CallStep {
  n: string;
  text: string;
}

/** Часть текста в блоке «Важно знать»: обычный текст или выделение <strong>. */
export type NotePart = string | { strong: string };

export interface Note {
  parts: NotePart[];
}

/** Полный контент лендинга SOS для одной локали. */
interface SosContent {
  hero: {
    kicker: string;
    titleLines: [string, string];
    lead: string;
    appStore: StoreLink;
    googlePlay: StoreLink;
    finePrint: string;
    screenshotLabel: string;
  };
  features: {
    title: string;
    items: AppFeature[];
  };
  how: {
    title: string;
    steps: CallStep[];
    aside: {
      title: string;
      notes: Note[];
      link: { label: string; href: string };
    };
  };
}

const ru: SosContent = {
  hero: {
    kicker: "Мобильное приложение Комитета",
    // Разбито по строкам для переноса <br>, как в макете.
    titleLines: ["SOS — помощь", "одной кнопкой"],
    lead: "Официальное приложение КЧС Таджикистана: экстренный вызов с автоматической передачей ваших координат спасателям, предупреждения о чрезвычайных ситуациях по вашему региону и инструкции, которые работают без интернета.",
    appStore: {
      href: "https://apps.apple.com/tj/app/sos-coescd-tj/id6502468447",
      label: "Загрузить в App Store",
    } as StoreLink,
    googlePlay: {
      href: "https://play.google.com/store/apps/details?id=com.khf_dev.SOSApplication&hl=ru",
      label: "Доступно в Google Play",
    } as StoreLink,
    finePrint: "Бесплатно · iOS 14+ и Android 8+ · таджикский и русский языки",
    screenshotLabel: "Скриншот приложения SOS",
  },

  features: {
    title: "Что умеет приложение",
    items: [
      {
        icon: "sos",
        borderColor: "var(--hz-critical)",
        iconColor: "var(--hz-critical)",
        title: "Кнопка SOS",
        desc: "Один жест — и сигнал с вашими координатами уходит в службу 112. Работает, даже если вы не можете говорить.",
      },
      {
        icon: "bell",
        borderColor: "var(--hz-warning)",
        iconColor: "var(--hz-warning)",
        title: "Оповещения о ЧС",
        desc: "Push-предупреждения КЧС по выбранным регионам: сели, землетрясения, лавины, штормовая погода.",
      },
      {
        icon: "book",
        borderColor: "var(--color-accent)",
        iconColor: "var(--color-accent-700)",
        title: "Инструкции офлайн",
        desc: "Пошаговые действия при землетрясении, селе, лавине и первая помощь — доступны без связи и интернета.",
      },
    ] as AppFeature[],
  },

  how: {
    title: "Как работает экстренный вызов",
    steps: [
      {
        n: "01",
        text: "Нажмите и удерживайте кнопку SOS три секунды — случайные нажатия исключены.",
      },
      {
        n: "02",
        text: "Приложение передаёт в ЦУКС ваши координаты, номер телефона и данные профиля (группа крови, хронические заболевания — если вы их указали).",
      },
      {
        n: "03",
        text: "Оператор 112 перезванивает вам; если ответить невозможно — наряд направляется по координатам.",
      },
      {
        n: "04",
        text: "Статус вызова отображается в приложении до прибытия помощи.",
      },
    ] as CallStep[],
    aside: {
      title: "Важно знать",
      notes: [
        {
          parts: [
            "Приложение дополняет, но не заменяет звонок на ",
            { strong: "112" },
            ". Если телефон под рукой и вы можете говорить — звоните напрямую.",
          ],
        },
        {
          parts: [
            "Геолокация используется только в момент вызова SOS и не отслеживается в фоне. Персональные данные защищены законодательством РТ.",
          ],
        },
      ] as Note[],
      link: {
        label: "Инструкции населению на портале →",
        href: routes.guides,
      },
    },
  },
};

const tj: SosContent = {
  hero: {
    kicker: "Барномаи мобилии Кумита",
    titleLines: ["SOS — кӯмак", "бо як тугма"],
    lead: "Барномаи расмии КҲФ-и Тоҷикистон: занги фавқулодда бо интиқоли худкори координатҳои шумо ба наҷотдиҳандагон, огоҳиҳо дар бораи ҳолатҳои фавқулода аз рӯи минтақаи шумо ва дастурҳое, ки бе интернет кор мекунанд.",
    appStore: {
      href: "https://apps.apple.com/tj/app/sos-coescd-tj/id6502468447",
      label: "Боргирӣ аз App Store",
    } as StoreLink,
    googlePlay: {
      href: "https://play.google.com/store/apps/details?id=com.khf_dev.SOSApplication&hl=ru",
      label: "Дастрас дар Google Play",
    } as StoreLink,
    finePrint: "Ройгон · iOS 14+ ва Android 8+ · забонҳои тоҷикӣ ва русӣ",
    screenshotLabel: "Скриншоти барномаи SOS",
  },

  features: {
    title: "Имкониятҳои барнома",
    items: [
      {
        icon: "sos",
        borderColor: "var(--hz-critical)",
        iconColor: "var(--hz-critical)",
        title: "Тугмаи SOS",
        desc: "Як ҳаракат — ва сигнал бо координатҳои шумо ба хидмати 112 меравад. Ҳатто вақте ки шумо сухан гуфта наметавонед, кор мекунад.",
      },
      {
        icon: "bell",
        borderColor: "var(--hz-warning)",
        iconColor: "var(--hz-warning)",
        title: "Огоҳиҳо дар бораи ҲФ",
        desc: "Огоҳиҳои push-и КҲФ аз рӯи минтақаҳои интихобшуда: сел, заминҷунбӣ, тарма, ҳавои тӯфонӣ.",
      },
      {
        icon: "book",
        borderColor: "var(--color-accent)",
        iconColor: "var(--color-accent-700)",
        title: "Дастурҳои офлайн",
        desc: "Амалҳои қадам ба қадам ҳангоми заминҷунбӣ, сел, тарма ва ёрии аввалия — бе алоқа ва интернет дастрасанд.",
      },
    ] as AppFeature[],
  },

  how: {
    title: "Занги фавқулодда чӣ гуна кор мекунад",
    steps: [
      {
        n: "01",
        text: "Тугмаи SOS-ро се сония пахш карда нигоҳ доред — пахшкунии тасодуфӣ истисно мешавад.",
      },
      {
        n: "02",
        text: "Барнома координатҳо, рақами телефон ва маълумоти профили шуморо ба МИБ мефиристад (гурӯҳи хун, бемориҳои музмин — агар онҳоро нишон дода бошед).",
      },
      {
        n: "03",
        text: "Оператори 112 ба шумо занг мезанад; агар ҷавоб додан имконнопазир бошад — гурӯҳ аз рӯи координатҳо фиристода мешавад.",
      },
      {
        n: "04",
        text: "Ҳолати занг то расидани кӯмак дар барнома нишон дода мешавад.",
      },
    ] as CallStep[],
    aside: {
      title: "Донистан муҳим аст",
      notes: [
        {
          parts: [
            "Барнома занги ",
            { strong: "112" },
            "-ро пурра мекунад, вале онро иваз намекунад. Агар телефон дар даст бошад ва шумо сухан гуфта тавонед — мустақиман занг занед.",
          ],
        },
        {
          parts: [
            "Геолокатсия танҳо ҳангоми занги SOS истифода мешавад ва дар паснамо пайгирӣ намешавад. Маълумоти шахсӣ бо қонунгузории ҶТ ҳифз шудааст.",
          ],
        },
      ] as Note[],
      link: {
        label: "Дастурҳо ба аҳолӣ дар портал →",
        href: routes.guides,
      },
    },
  },
};

const en: SosContent = {
  hero: {
    kicker: "The Committee's mobile app",
    titleLines: ["SOS — help", "one tap away"],
    lead: "The official app of Tajikistan's CoES: emergency calls that automatically send your coordinates to rescuers, alerts about emergencies in your region, and instructions that work without the internet.",
    appStore: {
      href: "https://apps.apple.com/tj/app/sos-coescd-tj/id6502468447",
      label: "Download on the App Store",
    } as StoreLink,
    googlePlay: {
      href: "https://play.google.com/store/apps/details?id=com.khf_dev.SOSApplication&hl=ru",
      label: "Available on Google Play",
    } as StoreLink,
    finePrint: "Free · iOS 14+ and Android 8+ · Tajik and Russian",
    screenshotLabel: "SOS app screenshot",
  },

  features: {
    title: "What the app can do",
    items: [
      {
        icon: "sos",
        borderColor: "var(--hz-critical)",
        iconColor: "var(--hz-critical)",
        title: "SOS button",
        desc: "One gesture sends a signal with your coordinates to the 112 service. It works even when you can't speak.",
      },
      {
        icon: "bell",
        borderColor: "var(--hz-warning)",
        iconColor: "var(--hz-warning)",
        title: "Emergency alerts",
        desc: "CoES push alerts for your selected regions: mudflows, earthquakes, avalanches, stormy weather.",
      },
      {
        icon: "book",
        borderColor: "var(--color-accent)",
        iconColor: "var(--color-accent-700)",
        title: "Offline instructions",
        desc: "Step-by-step actions for earthquakes, mudflows and avalanches, plus first aid — available without a connection or the internet.",
      },
    ] as AppFeature[],
  },

  how: {
    title: "How the emergency call works",
    steps: [
      {
        n: "01",
        text: "Press and hold the SOS button for three seconds — accidental presses are ruled out.",
      },
      {
        n: "02",
        text: "The app transmits your coordinates, phone number and profile details (blood type, chronic illnesses — if you have entered them) to the Crisis Management Centre.",
      },
      {
        n: "03",
        text: "The 112 operator calls you back; if you can't answer, a team is dispatched to your coordinates.",
      },
      {
        n: "04",
        text: "The call status is shown in the app until help arrives.",
      },
    ] as CallStep[],
    aside: {
      title: "Important to know",
      notes: [
        {
          parts: [
            "The app complements but does not replace a call to ",
            { strong: "112" },
            ". If a phone is at hand and you can speak, call directly.",
          ],
        },
        {
          parts: [
            "Geolocation is used only at the moment of an SOS call and is not tracked in the background. Personal data is protected by the legislation of the RT.",
          ],
        },
      ] as Note[],
      link: {
        label: "Public guides on the portal →",
        href: routes.guides,
      },
    },
  },
};

/** Контент лендинга SOS для активной локали. */
export function getSos(locale: Locale): SosContent {
  return { ru, tj, en }[locale];
}
