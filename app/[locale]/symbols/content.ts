import type { Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/routes";

// Контент страницы «Государственные символы Республики Таджикистан».
// Официальные тексты локализованы: getSymbolsContent(locale) → ru/tj/en.
// Числовые/презентационные поля (size, maxWidth, src, href) одинаковы для локалей.

export interface CrumbItem {
  label: string;
  href?: string;
}

/** Абзац описания символа: размер и приглушённость варьируются. */
export interface SymbolParagraph {
  text: string;
  /** font-size в px. */
  size: number;
  /** line-height (unitless). По умолчанию 1.65. */
  lineHeight?: number;
  /** color-mix процент поверх --color-text; не указан — обычный цвет текста. */
  muted?: number;
}

/** Крупный блок символа: изображение слева, описание справа. */
export interface SymbolBlock {
  ariaLabel: string;
  kicker: string;
  title: string;
  image: {
    src: string;
    alt: string;
    /** max-width изображения в px. */
    maxWidth: number;
    /** тонкая рамка вокруг изображения (флаг). */
    bordered?: boolean;
  };
  body: SymbolParagraph[];
  /** Служебная сноска об утверждении (12px, приглушённая). */
  note: string;
}

interface SymbolsContent {
  breadcrumbs: CrumbItem[];
  hero: { title: string; lead: string };
  symbols: SymbolBlock[];
  anthem: {
    ariaLabel: string;
    kicker: string;
    title: string;
    card: { name: string; attribution: string[]; note: string };
    body: string[];
    note: { before: string; link: { label: string; href: string }; after: string };
  };
  usage: { ariaLabel: string; title: string; text: string };
}

const ru: SymbolsContent = {
  breadcrumbs: [
    { label: "Главная", href: routes.home },
    { label: "О нас" },
    { label: "Государственные символы" },
  ],
  hero: {
    title: "Государственные символы Республики Таджикистан",
    lead: "Государственный Флаг, Государственный Герб и Государственный Гимн — символы суверенитета Республики Таджикистан. Порядок их использования установлен постановлениями Маджлиси намояндагон Маджлиси Оли Республики Таджикистан от 14 марта 2007 года № 499 и № 500 и Законом РТ «О Государственном Гимне».",
  },
  symbols: [
    {
      ariaLabel: "Государственный Флаг",
      kicker: "Символ 01",
      title: "Государственный Флаг",
      image: {
        src: "/assets/flag-tj.png",
        alt: "Государственный Флаг Республики Таджикистан: три горизонтальные полосы — красная, белая с золотой короной и семью звёздами, зелёная",
        maxWidth: 340,
        bordered: true,
      },
      body: [
        {
          text: "Полотнище из трёх горизонтальных полос: красной, белой и зелёной. Ширина белой полосы в полтора раза больше красной и зелёной. В центре белой полосы — стилизованная золотая корона с полукругом из семи звёзд. Отношение ширины флага к длине — 1:2.",
          size: 14.5,
        },
        {
          text: "Красный цвет символизирует единство нации, белый — чистоту и снега гор, зелёный — природу и плодородие долин. Корона и семь звёзд выражают государственный суверенитет и дружбу народов.",
          size: 13.5,
          lineHeight: 1.6,
          muted: 68,
        },
      ],
      note: "Утверждён постановлением МН МО РТ от 14.03.2007, № 499. День Государственного флага — 24 ноября.",
    },
    {
      ariaLabel: "Государственный Герб",
      kicker: "Символ 02",
      title: "Государственный Герб",
      image: {
        src: "/assets/emblem-tj.png",
        alt: "Государственный Герб Республики Таджикистан: корона с семью звёздами в лучах солнца над горами, обрамлённая колосьями пшеницы и ветками хлопчатника",
        maxWidth: 240,
      },
      body: [
        {
          text: "Изображение стилизованной короны и полукруга из семи звёзд в лучах солнца, восходящего из-за гор, покрытых снегом. Герб обрамлён венком: справа — из колосьев пшеницы, слева — из веток хлопчатника с раскрытыми коробочками. Венок перевит лентой цветов Государственного Флага; в нижней части — раскрытая книга на подставке.",
          size: 14.5,
        },
      ],
      note: "Утверждён постановлением МН МО РТ от 14.03.2007, № 500. Изображение Герба на официальном сайте является обязательным атрибутом государственного органа.",
    },
  ],
  anthem: {
    ariaLabel: "Государственный Гимн",
    kicker: "Символ 03",
    title: "Государственный Гимн",
    card: {
      name: "«Суруди миллӣ»",
      attribution: [
        "Музыка — Сулаймон Юдаков.",
        "Слова — Гулназар Келди.",
        "Утверждён Законом РТ «О Государственном Гимне Республики Таджикистан» в 1994 году.",
      ],
      note: "Официальная запись гимна публикуется в разделе документов портала.",
    },
    body: [
      "Государственный Гимн исполняется при официальных церемониях: вступлении Президента в должность, открытии сессий Маджлиси Оли, подъёме Государственного Флага, встречах глав иностранных государств, а также в учебных заведениях в начале учебного года.",
      "При публичном исполнении Гимна присутствующие слушают его стоя. Не допускается исполнение Гимна в искажённой редакции.",
    ],
    note: {
      before: "Полный официальный текст на таджикском языке и нотная редакция — в ",
      link: { label: "каталоге документов", href: routes.documents },
      after: ".",
    },
  },
  usage: {
    ariaLabel: "Использование символов",
    title: "Использование государственных символов",
    text: "Государственные символы Республики Таджикистан используются на официальных ресурсах государственных органов в соответствии с законодательством. Надругательство над Государственным Флагом, Гербом и Гимном влечёт ответственность, установленную законом. Использование символов в коммерческих целях без разрешения не допускается.",
  },
};

const tj: SymbolsContent = {
  breadcrumbs: [
    { label: "Асосӣ", href: routes.home },
    { label: "Дар бораи мо" },
    { label: "Рамзҳои давлатӣ" },
  ],
  hero: {
    title: "Рамзҳои давлатии Ҷумҳурии Тоҷикистон",
    lead: "Парчами давлатӣ, Нишони давлатӣ ва Суруди миллӣ — рамзҳои соҳибихтиёрии Ҷумҳурии Тоҷикистон мебошанд. Тартиби истифодаи онҳо бо қарорҳои Маҷлиси намояндагони Маҷлиси Олии Ҷумҳурии Тоҷикистон аз 14 марти соли 2007 № 499 ва № 500 ва Қонуни ҶТ «Дар бораи Суруди миллӣ» муқаррар шудааст.",
  },
  symbols: [
    {
      ariaLabel: "Парчами давлатӣ",
      kicker: "Рамз 01",
      title: "Парчами давлатӣ",
      image: {
        src: "/assets/flag-tj.png",
        alt: "Парчами давлатии Ҷумҳурии Тоҷикистон: се тасмаи уфуқӣ — сурх, сафед бо тоҷи тиллоӣ ва ҳафт ситора, сабз",
        maxWidth: 340,
        bordered: true,
      },
      body: [
        {
          text: "Матоъ аз се тасмаи уфуқӣ: сурх, сафед ва сабз. Бари тасмаи сафед аз сурху сабз якуним баробар зиёд аст. Дар маркази тасмаи сафед — тоҷи стилизатсияшудаи тиллоӣ бо нимдоираи ҳафт ситора. Таносуби бар ба дарозии парчам — 1:2.",
          size: 14.5,
        },
        {
          text: "Ранги сурх рамзи ягонагии миллат, сафед — покӣ ва барфи кӯҳҳо, сабз — табиат ва ҳосилхезии водиҳо. Тоҷ ва ҳафт ситора соҳибихтиёрии давлатӣ ва дӯстии халқҳоро ифода мекунанд.",
          size: 13.5,
          lineHeight: 1.6,
          muted: 68,
        },
      ],
      note: "Бо қарори МН МО ҶТ аз 14.03.2007, № 499 тасдиқ шудааст. Рӯзи Парчами давлатӣ — 24 ноябр.",
    },
    {
      ariaLabel: "Нишони давлатӣ",
      kicker: "Рамз 02",
      title: "Нишони давлатӣ",
      image: {
        src: "/assets/emblem-tj.png",
        alt: "Нишони давлатии Ҷумҳурии Тоҷикистон: тоҷ бо ҳафт ситора дар нурҳои офтоб болои кӯҳҳо, иҳоташуда бо хӯшаҳои гандум ва навдаҳои пахта",
        maxWidth: 240,
      },
      body: [
        {
          text: "Тасвири тоҷи стилизатсияшуда ва нимдоираи ҳафт ситора дар нурҳои офтобе, ки аз паси кӯҳҳои барфпӯш тулӯъ мекунад. Нишон бо гулчанбар иҳота шудааст: аз рост — аз хӯшаҳои гандум, аз чап — аз навдаҳои пахта бо ғӯзапахтаҳои кушода. Гулчанбар бо тасмаи рангҳои Парчами давлатӣ печонида шудааст; дар қисми поён — китоби кушода дар рӯи пойгаҳ.",
          size: 14.5,
        },
      ],
      note: "Бо қарори МН МО ҶТ аз 14.03.2007, № 500 тасдиқ шудааст. Тасвири Нишон дар сомонаи расмӣ атрибути ҳатмии мақоми давлатӣ мебошад.",
    },
  ],
  anthem: {
    ariaLabel: "Суруди миллӣ",
    kicker: "Рамз 03",
    title: "Суруди миллӣ",
    card: {
      name: "«Суруди миллӣ»",
      attribution: [
        "Мусиқӣ — Сулаймон Юдаков.",
        "Матн — Гулназар Келдӣ.",
        "Бо Қонуни ҶТ «Дар бораи Суруди миллии Ҷумҳурии Тоҷикистон» соли 1994 тасдиқ шудааст.",
      ],
      note: "Сабти расмии суруд дар бахши ҳуҷҷатҳои портал нашр мешавад.",
    },
    body: [
      "Суруди миллӣ ҳангоми маросимҳои расмӣ иҷро мешавад: маросими савгандёдкунии Президент, кушодашавии сессияҳои Маҷлиси Олӣ, бардоштани Парчами давлатӣ, вохӯрии сарони давлатҳои хориҷӣ, инчунин дар муассисаҳои таълимӣ дар оғози соли таҳсил.",
      "Ҳангоми иҷрои оммавии Суруд ҳозирон онро истода гӯш мекунанд. Иҷрои Суруд дар таҳрири таҳрифшуда манъ аст.",
    ],
    note: {
      before: "Матни пурраи расмӣ бо забони тоҷикӣ ва таҳрири нотавӣ — дар ",
      link: { label: "феҳристи ҳуҷҷатҳо", href: routes.documents },
      after: ".",
    },
  },
  usage: {
    ariaLabel: "Истифодаи рамзҳо",
    title: "Истифодаи рамзҳои давлатӣ",
    text: "Рамзҳои давлатии Ҷумҳурии Тоҷикистон дар захираҳои расмии мақомоти давлатӣ мутобиқи қонунгузорӣ истифода мешаванд. Таҳқири Парчами давлатӣ, Нишон ва Суруд боиси ҷавобгарии муқаррарнамудаи қонун мегардад. Истифодаи рамзҳо бо мақсадҳои тиҷоратӣ бе иҷозат манъ аст.",
  },
};

const en: SymbolsContent = {
  breadcrumbs: [
    { label: "Home", href: routes.home },
    { label: "About us" },
    { label: "State symbols" },
  ],
  hero: {
    title: "State symbols of the Republic of Tajikistan",
    lead: "The State Flag, the State Emblem and the State Anthem are symbols of the sovereignty of the Republic of Tajikistan. The rules for their use are established by resolutions No. 499 and No. 500 of the Assembly of Representatives of the Supreme Assembly of the Republic of Tajikistan of 14 March 2007 and by the Law of the RT “On the State Anthem”.",
  },
  symbols: [
    {
      ariaLabel: "State Flag",
      kicker: "Symbol 01",
      title: "State Flag",
      image: {
        src: "/assets/flag-tj.png",
        alt: "State Flag of the Republic of Tajikistan: three horizontal stripes — red, white with a golden crown and seven stars, green",
        maxWidth: 340,
        bordered: true,
      },
      body: [
        {
          text: "A cloth of three horizontal stripes: red, white and green. The white stripe is one and a half times wider than the red and green ones. In the centre of the white stripe is a stylised golden crown with a semicircle of seven stars. The ratio of the flag's width to its length is 1:2.",
          size: 14.5,
        },
        {
          text: "Red symbolises the unity of the nation, white — purity and the snows of the mountains, green — nature and the fertility of the valleys. The crown and seven stars express state sovereignty and the friendship of peoples.",
          size: 13.5,
          lineHeight: 1.6,
          muted: 68,
        },
      ],
      note: "Approved by resolution No. 499 of the AR SA RT of 14.03.2007. State Flag Day is 24 November.",
    },
    {
      ariaLabel: "State Emblem",
      kicker: "Symbol 02",
      title: "State Emblem",
      image: {
        src: "/assets/emblem-tj.png",
        alt: "State Emblem of the Republic of Tajikistan: a crown with seven stars in the rays of the sun above the mountains, framed by ears of wheat and cotton branches",
        maxWidth: 240,
      },
      body: [
        {
          text: "A depiction of a stylised crown and a semicircle of seven stars in the rays of the sun rising from behind snow-covered mountains. The emblem is framed by a wreath: ears of wheat on the right, cotton branches with open bolls on the left. The wreath is entwined with a ribbon in the colours of the State Flag; at the bottom is an open book on a stand.",
          size: 14.5,
        },
      ],
      note: "Approved by resolution No. 500 of the AR SA RT of 14.03.2007. Displaying the Emblem on the official website is a mandatory attribute of a state authority.",
    },
  ],
  anthem: {
    ariaLabel: "State Anthem",
    kicker: "Symbol 03",
    title: "State Anthem",
    card: {
      name: "“Surudi Milli”",
      attribution: [
        "Music — Suleiman Yudakov.",
        "Lyrics — Gulnazar Keldi.",
        "Approved by the Law of the RT “On the State Anthem of the Republic of Tajikistan” in 1994.",
      ],
      note: "The official recording of the anthem is published in the portal's documents section.",
    },
    body: [
      "The State Anthem is performed at official ceremonies: the inauguration of the President, the opening of sessions of the Supreme Assembly, the raising of the State Flag, meetings of heads of foreign states, and in educational institutions at the start of the academic year.",
      "During a public performance of the Anthem, those present listen to it standing. Performing the Anthem in a distorted version is not permitted.",
    ],
    note: {
      before: "The full official text in Tajik and the musical score are in the ",
      link: { label: "document catalogue", href: routes.documents },
      after: ".",
    },
  },
  usage: {
    ariaLabel: "Use of symbols",
    title: "Use of state symbols",
    text: "The state symbols of the Republic of Tajikistan are used on the official resources of state authorities in accordance with the law. Desecration of the State Flag, Emblem and Anthem entails liability established by law. The use of the symbols for commercial purposes without permission is not allowed.",
  },
};

/** Официальный контент страницы символов для активной локали. */
export function getSymbolsContent(locale: Locale): SymbolsContent {
  return { ru, tj, en }[locale];
}
