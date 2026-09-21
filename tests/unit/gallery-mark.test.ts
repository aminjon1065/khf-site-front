import { describe, expect, it } from "vitest";
import {
  hasGalleryMark,
  splitBodyByGallery,
  stripGalleryMarks,
} from "@/lib/gallery-mark";

// Маркер фотогалереи: редактор CMS вставляет его в произвольное место тела
// (TipTap-узел, сериализуется как <figure class="cms-gallery">…</figure>).
// Эти проверки держат контракт «карусель там, где поставили маркер».

const MARK =
  '<figure class="cms-gallery"><span>Фотогалерея</span></figure>';

describe("маркер фотогалереи в теле материала", () => {
  it("режет тело по первому маркеру: до и после", () => {
    const html = `<p>Первый абзац.</p>${MARK}<p>Второй абзац.</p>`;

    expect(hasGalleryMark(html)).toBe(true);
    expect(splitBodyByGallery(html)).toEqual([
      "<p>Первый абзац.</p>",
      "<p>Второй абзац.</p>",
    ]);
  });

  it("второй и следующие маркеры удаляются: одна карусель на материал", () => {
    const html = `<p>А</p>${MARK}<p>Б</p>${MARK}<p>В</p>`;
    const [before, after] = splitBodyByGallery(html);

    expect(before).toBe("<p>А</p>");
    expect(after).toBe("<p>Б</p><p>В</p>");
    expect(hasGalleryMark(after)).toBe(false);
  });

  it("без маркера всё тело — одна часть", () => {
    expect(splitBodyByGallery("<p>Только текст</p>")).toEqual([
      "<p>Только текст</p>",
      "",
    ]);
    expect(hasGalleryMark("<p>Только текст</p>")).toBe(false);
  });

  it("узнаёт маркер среди других классов figure", () => {
    const html = `<figure class="re-figure wide"><img src="x" alt=""/></figure><figure class="wide cms-gallery left"><span>Фотогалерея</span></figure>`;

    expect(hasGalleryMark(html)).toBe(true);
  });

  it("stripGalleryMarks вырезает маркеры начисто", () => {
    expect(stripGalleryMarks(`<p>А</p>${MARK}<p>Б</p>`)).toBe(
      "<p>А</p><p>Б</p>",
    );
  });
});
