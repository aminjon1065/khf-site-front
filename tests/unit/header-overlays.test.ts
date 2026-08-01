// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  closeDetailsOnEscape,
  closeDetailsOutside,
  closeOverlaysIn,
} from "@/components/public/header/HeaderOverlays";

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

describe("closeDetailsOutside", () => {
  it("закрывает список, если кликнули мимо него", () => {
    const root = scope(
      "<details open><summary>О Комитете</summary></details><span id='elsewhere'>шапка</span>",
    );

    const closed = closeDetailsOutside(root, root.querySelector("#elsewhere"));

    expect(closed).toBe(1);
    expect(root.querySelector("details")?.hasAttribute("open")).toBe(false);
  });

  it("не трогает список, по которому кликнули", () => {
    // Иначе клик по собственному <summary> сначала закрыл бы список здесь,
    // а нативный обработчик тут же открыл бы его снова.
    const root = scope("<details open><summary id='s'>О Комитете</summary></details>");

    const closed = closeDetailsOutside(root, root.querySelector("#s"));

    expect(closed).toBe(0);
    expect(root.querySelector("details")?.hasAttribute("open")).toBe(true);
  });

  it("клик по соседнему заголовку закрывает первый список", () => {
    const root = scope(
      "<details open id='a'><summary>a</summary></details><details id='b'><summary id='sb'>b</summary></details>",
    );

    closeDetailsOutside(root, root.querySelector("#sb"));

    expect(root.querySelector("#a")?.hasAttribute("open")).toBe(false);
  });
});

describe("closeDetailsOnEscape", () => {
  it("закрывает список и возвращает фокус на его заголовок", () => {
    const root = scope("<details open><summary tabindex='0'>О Комитете</summary></details>");

    expect(closeDetailsOnEscape(root)).toBe(true);
    expect(root.querySelector("details")?.hasAttribute("open")).toBe(false);
    expect(document.activeElement).toBe(root.querySelector("summary"));
  });

  it("сообщает, что закрывать было нечего", () => {
    expect(closeDetailsOnEscape(scope("<details><summary>a</summary></details>"))).toBe(false);
  });
});
