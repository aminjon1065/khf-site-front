import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Регрессии волны 2: сломанные и опасные места интерфейса.
// Каждая проверка привязана к конкретному дефекту, а не к «стилю кода».

describe("шкала отступов объявлена целиком", () => {
  const css = readFileSync("app/globals.css", "utf8");

  it("нет ссылок на необъявленные --space-*", () => {
    const declared = new Set(
      [...css.matchAll(/--space-(\d+):/g)].map((m) => m[1]),
    );
    const used = new Set([...css.matchAll(/var\(--space-(\d+)\)/g)].map((m) => m[1]));

    // Неизвестная переменная делает всю декларацию margin недействительной,
    // и отступ молча схлопывается в ноль — заметить это по вёрстке трудно.
    expect([...used].filter((n) => !declared.has(n))).toEqual([]);
  });
});

describe("контраст критической заливки", () => {
  it("сплошной фон под белым текстом берётся из --hz-critical-solid", () => {
    const header = readFileSync("components/public/PublicHeader.tsx", "utf8");

    // Базовый --hz-critical в тёмной теме светлее и даёт 3.25:1 вместо 4.5:1.
    expect(header).not.toMatch(/background:\s*"var\(--hz-critical\)"/);
  });
});

describe("строка навигации не создаёт горизонтальный скролл", () => {
  const header = readFileSync("components/public/PublicHeader.tsx", "utf8");

  it("контейнер пунктов переносится, а не обрезается", () => {
    // Пункты имеют flex: none и white-space: nowrap (globals.css), поэтому
    // при flex-nowrap строка вылезала за границу документа.
    expect(header).not.toMatch(/max-w-\[1160px\]\s+flex-nowrap/);
  });

  it("112 и SOS не делят flex-ряд с пунктами — иначе компактный 112 наезжает", () => {
    expect(header).toMatch(/knav-primary/);
    expect(header).toMatch(/knav-tools/);
    expect(header).not.toMatch(/flex min-w-0 flex-1 items-center justify-end/);
  });
});

describe("мобильная оболочка не провоцирует промахи и переполнение", () => {
  it("длинная шапка секции переносит действие на новую строку", () => {
    const ui = readFileSync("components/public/ui.tsx", "utf8");

    expect(ui).toMatch(/max-\[560px\]:flex-wrap/);
    expect(ui).toMatch(/max-\[560px\]:ml-auto/);
  });

  it("язык, тема и госсимволы получают 44px цель на мобильном", () => {
    const header = readFileSync("components/public/PublicHeader.tsx", "utf8");
    const theme = readFileSync(
      "components/public/header/ThemeToggle.tsx",
      "utf8",
    );
    const locale = readFileSync(
      "components/public/header/LocaleSwitcher.tsx",
      "utf8",
    );

    expect(header).toMatch(/max-\[920px\]:min-h-11/);
    expect(theme).toMatch(/max-\[920px\]:min-h-11/);
    expect(locale).toMatch(/max-\[920px\]:min-h-11/);
  });
});

describe("тёмная тема не гасит текст на акцентной плитке", () => {
  const css = readFileSync("app/globals.css", "utf8");

  it("наведение использует собственный токен, а не инвертируемый accent-800", () => {
    expect(css).toMatch(
      /\.accent-900-hover:hover\s*\{\s*background:\s*var\(--color-accent-900-hover\)/,
    );
  });

  it("токен наведения определён в обеих темах", () => {
    const light = css.indexOf("--color-accent-900-hover");
    const dark = css.indexOf("--color-accent-900-hover", light + 1);

    expect(light).toBeGreaterThan(-1);
    expect(dark).toBeGreaterThan(-1);
  });
});

describe("результаты поиска остаются ссылками", () => {
  it("role=listitem не навешен на сам <Link>", () => {
    const search = readFileSync("app/[locale]/search/page.tsx", "utf8");
    const linkBlocks = search.match(/<Link[\s\S]{0,240}?>/g) ?? [];

    // role="listitem" перекрывает неявную роль link, и выдача пропадает из
    // списка ссылок страницы для вспомогательных технологий.
    expect(linkBlocks.filter((b) => b.includes('role="listitem"'))).toEqual([]);
  });
});

describe("электронная приёмная показывает причину отказа", () => {
  const formSource = readFileSync(
    "app/[locale]/contacts/ContactForm.tsx",
    "utf8",
  );

  it("читает пофайловые ошибки CMS вместо общего сообщения", () => {
    expect(formSource).toMatch(/res\.status === 422/);
    expect(formSource).toMatch(/body\?\.errors/);
  });

  it("ограничивает длину полей по правилам CMS", () => {
    // SubmissionRequest: name/email max:255, message max:5000.
    expect(formSource).toMatch(/maxLength=\{255\}/);
    expect(formSource).toMatch(/maxLength=\{5000\}/);
  });
});

describe("оперативная сводка объясняет ноль словами", () => {
  it("на главной пустое состояние — фраза, а не цифра 0", () => {
    const home = readFileSync("app/[locale]/page.tsx", "utf8");

    expect(home).toMatch(/home\.ops\.noneText/);
    expect(home).toMatch(/data\.alerts\.count > 0/);
  });
});

describe("слайдер главных новостей управляем", () => {
  const slider = readFileSync("components/public/NewsSlider.tsx", "utf8");

  it("даёт паузу, клавиши и свайп, а не только автопрокрутку", () => {
    expect(slider).toMatch(/ui\.pause/);
    expect(slider).toMatch(/ArrowLeft/);
    expect(slider).toMatch(/onTouchStart/);
    expect(slider).toMatch(/prefers-reduced-motion/);
  });

  it("не дублирует заголовок в alt фото — картинка ведёт на ту же статью", () => {
    expect(slider).toMatch(/tabIndex=\{-1\}/);
    expect(slider).toMatch(/aria-hidden="true"/);
  });

  it("загружает активное фото без lazy-задержки, но preload оставляет первому", () => {
    expect(slider).toMatch(/\beager\s*\n\s*preload=\{slide === 0\}/);
  });
});

describe("главная имеет один локализованный заголовок страницы", () => {
  it("использует название учреждения из словаря, а не жёсткую строку", () => {
    const home = readFileSync("app/[locale]/page.tsx", "utf8");

    expect(home).toMatch(/<h1 className="sr-only">\{common\.siteName\}<\/h1>/);
  });
});

describe("локализованные гербы сохраняют собственные пропорции", () => {
  it("шапка и подвал не переопределяют размеры статического импорта", () => {
    const header = readFileSync("components/public/PublicHeader.tsx", "utf8");
    const footer = readFileSync("components/public/PublicFooter.tsx", "utf8");

    expect(header).not.toMatch(/src=\{logoImage\}[\s\S]{0,100}width=\{/);
    expect(footer).not.toMatch(/src=\{logoImage\}[\s\S]{0,100}width=\{/);
  });
});

describe("портал не обещает того, чего не делает", () => {
  it("формы подписки на оповещения нет — эндпоинта под неё не существует", () => {
    const news = readFileSync("app/[locale]/news/page.tsx", "utf8");
    const content = readFileSync("app/[locale]/news/content.ts", "utf8");

    expect(news).not.toMatch(/type="email"/);
    expect(content).not.toMatch(/subscribe:/);
  });
});
