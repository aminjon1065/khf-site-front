// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { closeOverlaysIn } from "@/components/public/header/CloseOnNavigate";

// Регрессия: после переноса шапки в layout она перестала перемонтироваться при
// переходе, и открытый выпадающий список оставался раскрытым уже на новой
// странице (то же самое — модальное мобильное меню).

function scope(html: string): HTMLElement {
  const root = document.createElement("header");
  root.innerHTML = html;
  document.body.append(root);

  return root;
}

describe("closeOverlaysIn", () => {
  it("закрывает раскрытые <details>", () => {
    const root = scope(
      "<details open><summary>О Комитете</summary><a href='/ru/leadership'>Руководство</a></details>",
    );

    closeOverlaysIn(root);

    expect(root.querySelector("details")?.hasAttribute("open")).toBe(false);
  });

  it("закрывает открытое модальное меню", () => {
    const root = scope("<dialog open id='public-mobile-menu'></dialog>");

    closeOverlaysIn(root);

    expect(root.querySelector("dialog")?.hasAttribute("open")).toBe(false);
  });

  it("не трогает уже закрытые элементы и не падает на пустой шапке", () => {
    const root = scope("<details><summary>Меню</summary></details>");

    expect(() => closeOverlaysIn(root)).not.toThrow();
    expect(root.querySelector("details")?.hasAttribute("open")).toBe(false);
    expect(() => closeOverlaysIn(scope(""))).not.toThrow();
  });

  it("закрывает сразу все раскрытые списки, а не только первый", () => {
    const root = scope(
      "<details open><summary>a</summary></details><details open><summary>b</summary></details>",
    );

    closeOverlaysIn(root);

    expect([...root.querySelectorAll("details")].every((d) => !d.open)).toBe(true);
  });
});
