// @vitest-environment jsdom
import { createElement } from "react";
import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionHeader } from "@/components/public/ui";

// Уровень заголовка секции задаётся явно (`as`), а не выводится из кегля.
// Раньше SectionHeader всегда печатал <h3>: на главной, где единственный h1 —
// sr-only название портала, структура документа прыгала с 1 сразу на 3, а
// навигация по заголовкам в скринридере теряла уровень «разделы страницы».
//
// Без JSX (createElement): набор unit-тестов собирается из *.test.ts, а
// заводить .tsx и @testing-library/jest-dom ради трёх проверок незачем.
describe("SectionHeader", () => {
  it("по умолчанию остаётся h3 — вложенный подраздел", () => {
    const { container } = render(
      createElement(SectionHeader, { title: "Вложенный блок" }),
    );

    expect(
      within(container).getByRole("heading", { level: 3 }).textContent,
    ).toBe("Вложенный блок");
  });

  it("основная секция страницы объявляется как h2", () => {
    const { container } = render(
      createElement(SectionHeader, {
        as: "h2",
        title: "Обстановка по регионам",
      }),
    );

    // Запрос ограничен своим контейнером: render() не убирает предыдущий
    // тест из document.body, и глобальный поиск нашёл бы чужой заголовок.
    const scope = within(container);
    expect(scope.getByRole("heading", { level: 2 }).textContent).toBe(
      "Обстановка по регионам",
    );
    expect(scope.queryByRole("heading", { level: 3 })).toBeNull();
  });

  it("визуальный размер не зависит от уровня — семантика отдельно от оформления", () => {
    const { container: asH2 } = render(
      createElement(SectionHeader, { as: "h2", title: "A" }),
    );
    const { container: asH3 } = render(
      createElement(SectionHeader, { as: "h3", title: "A" }),
    );

    expect(asH2.querySelector("h2")?.className).toBe(
      asH3.querySelector("h3")?.className,
    );
  });
});
