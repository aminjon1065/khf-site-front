import { describe, expect, it } from "vitest";
import { en } from "@/lib/i18n/dictionaries/en";
import { ru } from "@/lib/i18n/dictionaries/ru";
import { tj } from "@/lib/i18n/dictionaries/tj";

function objectShape(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(objectShape);
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, objectShape(child)]),
    );
  }

  return typeof value;
}

describe("localized dictionaries", () => {
  it("keep the same nested structure in ru, tj and en", () => {
    expect(objectShape(tj)).toEqual(objectShape(ru));
    expect(objectShape(en)).toEqual(objectShape(ru));
  });
});
