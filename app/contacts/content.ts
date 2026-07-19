// Контент страницы «Контакты» (заглушка CMS). Всё пользовательское содержимое и
// данные списков вынесены сюда; представление (page.tsx / ContactForm.tsx)
// читает только отсюда — как lib/copy/home.ts для главной.

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
  };
  success: {
    strong: string;
    text: string;
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

export const contacts: ContactsContent = {
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
    },
    success: {
      strong: "Обращение отправлено.",
      text: " Номер для отслеживания: КЧС-2026-08412. Копия направлена на указанную почту.",
    },
  },
};
