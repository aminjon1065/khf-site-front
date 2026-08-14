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
        children: [{ label: "Руководство", href: "/leadership" }],
      },
    ]);
  });

  it("drops a parent that has neither a URL nor children", () => {
    expect(
      cmsMenuToNavItems([{ label: "Пусто", url: null, children: [] }], labels),
    ).toEqual([]);
  });

  it("prefers the dictionary label for known public routes", () => {
    const items = cmsMenuToNavItems(
      [{ label: "News from CMS", url: "/news", children: [] }],
      labels,
    );

    expect(items[0]?.label).toBe("Новости");
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
      { label: "Руководство", href: "/leadership" },
    ]);
  });
});
