import { describe, expect, it } from "vitest";
// Import the locale modules directly, bypassing `lib/i18n/dictionaries.ts`
// (guarded by `server-only`, which rejects a plain Node/Vitest import).
import { ru } from "@/lib/i18n/dictionaries/ru";
import { tj } from "@/lib/i18n/dictionaries/tj";
import { en } from "@/lib/i18n/dictionaries/en";

/** Recursively collects sorted "a.b.c" key paths, walking into plain objects only. */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value) || value === null || typeof value !== "object") {
    return [prefix];
  }

  return Object.entries(value as Record<string, unknown>)
    .flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key))
    .sort();
}

describe("dictionary structural equivalence", () => {
  const ruKeys = keyPaths(ru);

  it("tj has exactly the same key paths as ru", () => {
    expect(keyPaths(tj)).toEqual(ruKeys);
  });

  it("en has exactly the same key paths as ru", () => {
    expect(keyPaths(en)).toEqual(ruKeys);
  });

  it("is not vacuously true (the dictionary actually has content)", () => {
    expect(ruKeys.length).toBeGreaterThan(20);
  });
});
