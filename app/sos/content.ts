import { routes } from "@/lib/routes";

// Контент лендинга мобильного приложения SOS (заглушка CMS).
// Представление (app/sos/page.tsx) читает только отсюда — строк в JSX нет.

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

export const sos = {
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
