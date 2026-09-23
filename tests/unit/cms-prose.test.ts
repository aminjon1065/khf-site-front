// @vitest-environment jsdom
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CmsProse, { hasCmsBody } from "@/components/public/CmsProse";
import { muted } from "@/components/public/muted";

// Тело CMS-страницы выводит один компонент — /pages/[slug], /about и лиды
// разделов «О нас». Без JSX (createElement): unit-набор собирается из *.test.ts.

describe("hasCmsBody", () => {
  it("treats the markup an empty editor saves as no body", () => {
    expect(hasCmsBody(undefined)).toBe(false);
    expect(hasCmsBody("")).toBe(false);
    expect(hasCmsBody("   \n ")).toBe(false);
    expect(hasCmsBody("<p></p>")).toBe(false);
    expect(hasCmsBody("<p>&nbsp;</p><p> </p>")).toBe(false);
  });

  it("finds text in HTML and in legacy plain text", () => {
    expect(hasCmsBody("<p>Текст</p>")).toBe(true);
    expect(hasCmsBody("<h2>Раздел</h2>")).toBe(true);
    expect(hasCmsBody("Простой текст старой записи")).toBe(true);
  });

  it("counts an embedded image or video as content", () => {
    expect(hasCmsBody('<p><img src="/storage/a.jpg" alt=""></p>')).toBe(true);
    expect(hasCmsBody('<iframe src="https://www.youtube-nocookie.com/embed/x"></iframe>')).toBe(true);
  });
});

describe("CmsProse", () => {
  it("renders sanitised HTML as is inside .article-prose", () => {
    const { container } = render(
      createElement(CmsProse, { body: "<h2>Раздел</h2><p>Абзац</p>" }),
    );

    const prose = container.querySelector(".article-prose");
    expect(prose?.innerHTML).toBe("<h2>Раздел</h2><p>Абзац</p>");
    expect(prose?.classList.contains("article-prose-intro")).toBe(false);
  });

  it("splits legacy plain text into escaped paragraphs", () => {
    const { container } = render(
      createElement(CmsProse, { body: "Первый <абзац\n\nВторой" }),
    );

    const paragraphs = [...container.querySelectorAll("p")];
    expect(paragraphs.map((p) => p.textContent)).toEqual([
      "Первый <абзац",
      "Второй",
    ]);
    expect(container.querySelector(".article-prose")).toBeNull();
  });

  it("shows the placeholder for an empty article body", () => {
    const { container } = render(
      createElement(CmsProse, {
        body: "<p></p>",
        placeholder: "Содержание страницы готовится.",
      }),
    );

    expect(container.textContent).toBe("Содержание страницы готовится.");
  });

  it("renders a muted intro container with the page's own width classes", () => {
    // Серверная разметка, а не DOM jsdom: его CSS-парсер не знает color-mix()
    // и молча выбросил бы приглушённый цвет из style.
    const html = renderToStaticMarkup(
      createElement(CmsProse, {
        body: "<p>Вводный текст</p>",
        variant: "intro",
        className: "max-w-[64ch]",
      }),
    );

    expect(html).toBe(
      `<div class="article-prose article-prose-intro max-w-[64ch]" style="color:${muted(70)}"><p>Вводный текст</p></div>`,
    );
  });

  it("wraps plain-text intros in the same container", () => {
    const { container } = render(
      createElement(CmsProse, { body: "Строка один\nСтрока два", variant: "intro" }),
    );

    const intro = container.firstElementChild as HTMLElement;
    expect(intro.classList.contains("article-prose-intro")).toBe(true);
    expect(intro.querySelectorAll("p")).toHaveLength(2);
  });

  it("renders nothing for an empty intro, so the section keeps its own text", () => {
    const { container } = render(
      createElement(CmsProse, {
        body: "<p>&nbsp;</p>",
        variant: "intro",
        placeholder: "не для лида",
      }),
    );

    expect(container.innerHTML).toBe("");
  });
});
