import { describe, expect, it } from "vitest";
import { cmsMenuToNavItems, flattenFooterMenu } from "@/lib/cms-menu";
import type { ApiMenuItem } from "@/lib/api";

const labels = {
  "/news": "Новости",
  "/leadership": "Руководство",
};

const group: ApiMenuItem = {
  label: "О комитете",
  url: null,
  children: [
    { label: "Председатель", url: "/leadership" },
    { label: "Без ссылки", url: null },
  ],
};

describe("cmsMenuToNavItems", () => {
  it("keeps a parent without a URL when it has children", () => {
    const items = cmsMenuToNavItems([group], labels);

    expect(items).toEqual([
      {
        label: "О комитете",
        href: "",
        children: [{ label: "Председатель", href: "/leadership" }],
      },
    ]);
  });

  it("drops a parent that has neither a URL nor children", () => {
    expect(
      cmsMenuToNavItems([{ label: "Пусто", url: null, children: [] }], labels),
    ).toEqual([]);
  });

  it("shows the label the editor typed, even for a built-in route", () => {
    // Раньше словарь молча подменял подпись встроенных разделов, и
    // переименование пункта в CMS на сайт не попадало.
    const items = cmsMenuToNavItems(
      [{ label: "  Новости и заявления ", url: "/news", children: [] }],
      labels,
    );

    expect(items[0]?.label).toBe("Новости и заявления");
  });

  it("falls back to the dictionary only when the CMS label is empty", () => {
    const items = cmsMenuToNavItems(
      [
        { label: "", url: "/news", children: [] },
        {
          label: "   ",
          url: null,
          children: [{ label: "", url: "/leadership" }],
        },
      ],
      labels,
    );

    // Непереведённый встроенный раздел получает подпись словаря; группа без
    // подписи и без адреса подписи взять неоткуда, и она отбрасывается.
    expect(items).toEqual([{ label: "Новости", href: "/news", children: [] }]);
  });

  it("drops an untranslated item with a custom URL — there is nothing to show", () => {
    expect(
      cmsMenuToNavItems(
        [{ label: "", url: "/pages/privacy", children: [] }],
        labels,
      ),
    ).toEqual([]);
  });

  it("does not read dictionary labels from the object prototype", () => {
    expect(
      cmsMenuToNavItems([{ label: "", url: "toString", children: [] }], labels),
    ).toEqual([]);
  });
});

describe("flattenFooterMenu", () => {
  it("lists the parent and each child that has a URL", () => {
    expect(
      flattenFooterMenu(
        [
          {
            label: "Документы",
            url: "/documents",
            children: [{ label: "Отчёт", url: "/documents/report" }],
          },
        ],
        {},
      ),
    ).toEqual([
      { label: "Документы", href: "/documents" },
      { label: "Отчёт", href: "/documents/report" },
    ]);
  });

  it("skips a parent without a URL and still keeps its children", () => {
    expect(flattenFooterMenu([group], labels)).toEqual([
      { label: "Председатель", href: "/leadership" },
    ]);
  });

  it("uses the CMS label first and the dictionary only for an empty one", () => {
    expect(
      flattenFooterMenu(
        [
          { label: "Новости КЧС", url: "/news", children: [] },
          { label: "", url: "/leadership", children: [] },
          { label: "", url: "/pages/privacy", children: [] },
        ],
        labels,
      ),
    ).toEqual([
      { label: "Новости КЧС", href: "/news" },
      { label: "Руководство", href: "/leadership" },
    ]);
  });
});
