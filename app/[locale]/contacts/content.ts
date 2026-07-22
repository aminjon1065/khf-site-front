// Контент страницы «Контакты» (заглушка CMS). Всё пользовательское содержимое и
// данные списков вынесены сюда; представление (page.tsx / ContactForm.tsx)
// читает только отсюда — как lib/copy/home.ts для главной.
// Текст локализован: getContacts(locale) возвращает ru/tj/en.
import type { Locale } from "@/lib/i18n/config";

export interface EmergencyPhoneCard {
  kicker: string;
  phone: string;
  phoneHref: string;
  note: string;
}

export interface EmergencyHqCard {
  kicker: string;
  address: string;
  email: string;
  emailHref: string;
  hours: string;
}

export interface OfficeRow {
  name: string;
  head: string;
  address: string;
  tel: string;
  telHref: string;
  email: string;
}

export interface ReceptionContent {
  title: string;
  intro: string;
  form: {
    name: { label: string };
    email: { label: string; hint: string };
    topic: { label: string; options: string[] };
    text: { label: string };
    consent: string;
    consentError: string;
    submit: string;
    sending: string;
    serverError: string;
  };
  success: {
    strong: string;
    text: string;
    trackingLabel: string;
    copySent: string;
  };
}

export interface ContactsContent {
  title: string;
  subtitle: string;
  emergency: {
    ariaLabel: string;
    critical: EmergencyPhoneCard;
    trust: EmergencyPhoneCard;
    hq: EmergencyHqCard;
  };
  offices: {
    ariaLabel: string;
    title: string;
    rows: OfficeRow[];
  };
  reception: ReceptionContent;
}

const ru: ContactsContent = {
  title: "Контакты",
  subtitle: "Центральный аппарат и региональные управления",
  emergency: {
    ariaLabel: "Экстренная помощь",
    critical: {
      kicker: "Угроза жизни",
      phone: "112",
      phoneHref: "tel:112",
      note: "Единая служба спасения. Круглосуточно, бесплатно, работает без SIM-карты.",
    },
    trust: {
      kicker: "Телефон доверия",
      phone: "+992 (37) 221-59-00",
      phoneHref: "tel:+992372215900",
      note: "Вопросы, не требующие экстренного реагирования; сообщения о нарушениях.",
    },
    hq: {
      kicker: "Центральный аппарат",
      address: "734018, г. Душанбе, ул. Лохути, 26",
      email: "info@khf.tj",
      emailHref: "mailto:info@khf.tj",
      hours: "пн–пт, 08:00–17:00",
    },
  },
  offices: {
    ariaLabel: "Региональные управления",
    title: "Региональные управления",
    rows: [
      {
        name: "г. Душанбе",
        head: "Управление по г. Душанбе",
        address: "ул. Н. Карабаева, 54",
        tel: "+992 (37) 233-18-05",
        telHref: "+992372331805",
        email: "dushanbe@khf.tj",
      },
      {
        name: "Согдийская область",
        head: "Управление по Согдийской области",
        address: "г. Худжанд, ул. Камола Худжанди, 120",
        tel: "+992 (3422) 6-44-71",
        telHref: "+992342264471",
        email: "sughd@khf.tj",
      },
      {
        name: "Хатлонская область",
        head: "Управление по Хатлонской области",
        address: "г. Бохтар, ул. Айни, 47",
        tel: "+992 (3222) 2-38-90",
        telHref: "+992322223890",
        email: "khatlon@khf.tj",
      },
      {
        name: "ГБАО",
        head: "Управление по ГБАО",
        address: "г. Хорог, ул. Ленина, 18",
        tel: "+992 (3522) 2-25-13",
        telHref: "+992352222513",
        email: "gbao@khf.tj",
      },
      {
        name: "РРП",
        head: "Управление по районам республиканского подчинения",
        address: "г. Вахдат, ул. Исмоили Сомони, 9",
        tel: "+992 (3136) 2-27-44",
        telHref: "+992313622744",
        email: "rrp@khf.tj",
      },
    ],
  },
  reception: {
    title: "Электронная приёмная",
    intro:
      "Обращения рассматриваются в порядке, установленном Законом РТ «Об обращениях физических и юридических лиц». Срок ответа — до 15 рабочих дней.",
    form: {
      name: { label: "ФИО" },
      email: {
        label: "Электронная почта",
        hint: "На неё придёт номер обращения и ответ",
      },
      topic: {
        label: "Тема",
        options: [
          "Вопрос о деятельности Комитета",
          "Сообщение о нарушении",
          "Предложение",
          "Жалоба",
        ],
      },
      text: { label: "Текст обращения" },
      consent:
        "Я согласен(на) на обработку персональных данных в соответствии с законодательством Республики Таджикистан",
      consentError:
        "Подтвердите согласие на обработку персональных данных — без него обращение не может быть принято.",
      submit: "Отправить обращение",
      sending: "Отправка…",
      serverError: "Не удалось отправить обращение. Попробуйте позже или позвоните 112.",
    },
    success: {
      strong: "Обращение отправлено.",
      text: " Номер для отслеживания: КЧС-2026-08412. Копия направлена на указанную почту.",
      trackingLabel: "Номер для отслеживания:",
      copySent: "Копия направлена на указанную почту.",
    },
  },
};

const tj: ContactsContent = {
  title: "Тамос",
  subtitle: "Дастгоҳи марказӣ ва идораҳои минтақавӣ",
  emergency: {
    ariaLabel: "Кӯмаки фавқулода",
    critical: {
      kicker: "Таҳдид ба ҳаёт",
      phone: "112",
      phoneHref: "tel:112",
      note: "Хидмати ягонаи наҷот. Шабонарӯзӣ, ройгон, бе корти SIM кор мекунад.",
    },
    trust: {
      kicker: "Телефони боварӣ",
      phone: "+992 (37) 221-59-00",
      phoneHref: "tel:+992372215900",
      note: "Саволҳое, ки вокуниши фаврӣ талаб намекунанд; хабар дар бораи вайронкуниҳо.",
    },
    hq: {
      kicker: "Дастгоҳи марказӣ",
      address: "734018, ш. Душанбе, кӯчаи Лоҳутӣ, 26",
      email: "info@khf.tj",
      emailHref: "mailto:info@khf.tj",
      hours: "дш–ҷм, 08:00–17:00",
    },
  },
  offices: {
    ariaLabel: "Идораҳои минтақавӣ",
    title: "Идораҳои минтақавӣ",
    rows: [
      {
        name: "ш. Душанбе",
        head: "Идораи шаҳри Душанбе",
        address: "кӯчаи Н. Қарабоев, 54",
        tel: "+992 (37) 233-18-05",
        telHref: "+992372331805",
        email: "dushanbe@khf.tj",
      },
      {
        name: "Вилояти Суғд",
        head: "Идораи вилояти Суғд",
        address: "ш. Хуҷанд, кӯчаи Камоли Хуҷандӣ, 120",
        tel: "+992 (3422) 6-44-71",
        telHref: "+992342264471",
        email: "sughd@khf.tj",
      },
      {
        name: "Вилояти Хатлон",
        head: "Идораи вилояти Хатлон",
        address: "ш. Бохтар, кӯчаи Айнӣ, 47",
        tel: "+992 (3222) 2-38-90",
        telHref: "+992322223890",
        email: "khatlon@khf.tj",
      },
      {
        name: "ВМКБ",
        head: "Идораи ВМКБ",
        address: "ш. Хоруғ, кӯчаи Ленин, 18",
        tel: "+992 (3522) 2-25-13",
        telHref: "+992352222513",
        email: "gbao@khf.tj",
      },
      {
        name: "НТҶ",
        head: "Идораи ноҳияҳои тобеи ҷумҳурӣ",
        address: "ш. Ваҳдат, кӯчаи Исмоили Сомонӣ, 9",
        tel: "+992 (3136) 2-27-44",
        telHref: "+992313622744",
        email: "rrp@khf.tj",
      },
    ],
  },
  reception: {
    title: "Қабулгоҳи электронӣ",
    intro:
      "Муроҷиатҳо тибқи тартиби муқаррарнамудаи Қонуни ҶТ «Дар бораи муроҷиатҳои шахсони воқеӣ ва ҳуқуқӣ» баррасӣ мешаванд. Мӯҳлати ҷавоб — то 15 рӯзи корӣ.",
    form: {
      name: { label: "Ному насаб" },
      email: {
        label: "Почтаи электронӣ",
        hint: "Ба он рақами муроҷиат ва ҷавоб меояд",
      },
      topic: {
        label: "Мавзӯъ",
        options: [
          "Савол оид ба фаъолияти Кумита",
          "Хабар дар бораи вайронкунӣ",
          "Пешниҳод",
          "Шикоят",
        ],
      },
      text: { label: "Матни муроҷиат" },
      consent:
        "Ман ба коркарди маълумоти шахсӣ тибқи қонунгузории Ҷумҳурии Тоҷикистон розӣ ҳастам",
      consentError:
        "Розигиро ба коркарди маълумоти шахсӣ тасдиқ кунед — бе он муроҷиат қабул карда намешавад.",
      submit: "Фиристодани муроҷиат",
      sending: "Фиристода истодааст…",
      serverError: "Муроҷиатро фиристодан нашуд. Дертар кӯшиш кунед ё ба 112 занг занед.",
    },
    success: {
      strong: "Муроҷиат фиристода шуд.",
      text: " Рақами пайгирӣ: КҲФ-2026-08412. Нусха ба почтаи зикршуда фиристода шуд.",
      trackingLabel: "Рақами пайгирӣ:",
      copySent: "Нусха ба почтаи зикршуда фиристода шуд.",
    },
  },
};

const en: ContactsContent = {
  title: "Contacts",
  subtitle: "Central office and regional offices",
  emergency: {
    ariaLabel: "Emergency assistance",
    critical: {
      kicker: "Threat to life",
      phone: "112",
      phoneHref: "tel:112",
      note: "Unified rescue service. Round-the-clock, free of charge, works without a SIM card.",
    },
    trust: {
      kicker: "Trust line",
      phone: "+992 (37) 221-59-00",
      phoneHref: "tel:+992372215900",
      note: "Questions that do not require an emergency response; reports of violations.",
    },
    hq: {
      kicker: "Central office",
      address: "26 Lohuti St., Dushanbe 734018",
      email: "info@khf.tj",
      emailHref: "mailto:info@khf.tj",
      hours: "Mon–Fri, 08:00–17:00",
    },
  },
  offices: {
    ariaLabel: "Regional offices",
    title: "Regional offices",
    rows: [
      {
        name: "Dushanbe",
        head: "Dushanbe City Office",
        address: "54 N. Karabaev St.",
        tel: "+992 (37) 233-18-05",
        telHref: "+992372331805",
        email: "dushanbe@khf.tj",
      },
      {
        name: "Sughd region",
        head: "Sughd Regional Office",
        address: "120 Kamoli Khujandi St., Khujand",
        tel: "+992 (3422) 6-44-71",
        telHref: "+992342264471",
        email: "sughd@khf.tj",
      },
      {
        name: "Khatlon region",
        head: "Khatlon Regional Office",
        address: "47 Aini St., Bokhtar",
        tel: "+992 (3222) 2-38-90",
        telHref: "+992322223890",
        email: "khatlon@khf.tj",
      },
      {
        name: "GBAO",
        head: "GBAO Office",
        address: "18 Lenin St., Khorog",
        tel: "+992 (3522) 2-25-13",
        telHref: "+992352222513",
        email: "gbao@khf.tj",
      },
      {
        name: "DRS",
        head: "Office for the Districts of Republican Subordination",
        address: "9 Ismoili Somoni St., Vahdat",
        tel: "+992 (3136) 2-27-44",
        telHref: "+992313622744",
        email: "rrp@khf.tj",
      },
    ],
  },
  reception: {
    title: "Electronic reception",
    intro:
      "Appeals are considered in the manner established by the Law of the RT “On appeals of individuals and legal entities”. The response time is up to 15 working days.",
    form: {
      name: { label: "Full name" },
      email: {
        label: "Email",
        hint: "The appeal number and reply will be sent to it",
      },
      topic: {
        label: "Subject",
        options: [
          "Question about the Committee's activities",
          "Report of a violation",
          "Suggestion",
          "Complaint",
        ],
      },
      text: { label: "Appeal text" },
      consent:
        "I consent to the processing of personal data in accordance with the legislation of the Republic of Tajikistan",
      consentError:
        "Please confirm your consent to the processing of personal data — without it the appeal cannot be accepted.",
      submit: "Submit appeal",
      sending: "Sending…",
      serverError: "Failed to send the appeal. Please try again later or call 112.",
    },
    success: {
      strong: "Appeal submitted.",
      text: " Tracking number: CoES-2026-08412. A copy has been sent to the specified email.",
      trackingLabel: "Tracking number:",
      copySent: "A copy has been sent to the specified email.",
    },
  },
};

/** Контент «Контакты» для активной локали. */
export function getContacts(locale: Locale): ContactsContent {
  return { ru, tj, en }[locale];
}
