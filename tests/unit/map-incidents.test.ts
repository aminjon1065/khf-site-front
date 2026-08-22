import { describe, expect, it } from "vitest";
import {
  uniqueAlerts,
  type LiveIncident,
} from "@/app/[locale]/map/incidents";

// Предупреждение раскрывается в запись на каждый затронутый регион — это нужно
// карте для заливки. Списку справа и счётчику нужна запись на предупреждение:
// иначе одно событие по трём регионам читается как три разных, а
// республиканское — как пять.

function incident(slug: string, regionKey: LiveIncident["regionKey"]): LiveIncident {
  return {
    kind: "Сель",
    level: "warning",
    time: "12:00",
    title: "Селевая опасность",
    region: "Хатлонская область",
    regionKey,
    slug,
  };
}

describe("uniqueAlerts", () => {
  it("сводит записи одного предупреждения в одну строку", () => {
    const expanded = [
      incident("sel-khatlon", "khatlon"),
      incident("sel-khatlon", "rrp"),
      incident("sel-khatlon", "sughd"),
    ];

    expect(uniqueAlerts(expanded)).toHaveLength(1);
  });

  it("республиканское предупреждение по пяти регионам — одно событие", () => {
    const countrywide = (
      ["dushanbe", "sughd", "khatlon", "rrp", "gbao"] as const
    ).map((k) => incident("countrywide", k));

    expect(uniqueAlerts(countrywide)).toHaveLength(1);
  });

  it("разные предупреждения остаются разными", () => {
    const mixed = [
      incident("sel-khatlon", "khatlon"),
      incident("sel-khatlon", "rrp"),
      incident("lavina-gbao", "gbao"),
    ];

    expect(uniqueAlerts(mixed).map((i) => i.slug)).toEqual([
      "sel-khatlon",
      "lavina-gbao",
    ]);
  });

  it("сохраняет порядок первой встреченной записи", () => {
    const ordered = [
      incident("b", "sughd"),
      incident("a", "khatlon"),
      incident("b", "rrp"),
    ];

    expect(uniqueAlerts(ordered).map((i) => i.slug)).toEqual(["b", "a"]);
    // Регион берётся у первой записи — поле `region` у копий одинаковое.
    expect(uniqueAlerts(ordered)[0].regionKey).toBe("sughd");
  });

  it("пустой список остаётся пустым", () => {
    expect(uniqueAlerts([])).toEqual([]);
  });
});
