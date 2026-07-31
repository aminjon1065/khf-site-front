import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const fontDirectory = join(process.cwd(), "app", "fonts");
const layoutSource = readFileSync(
  join(process.cwd(), "app", "[locale]", "layout.tsx"),
  "utf8",
);
const globalNotFoundSource = readFileSync(
  join(process.cwd(), "app", "global-not-found.tsx"),
  "utf8",
);

describe("critical font pipeline", () => {
  it("self-hosts exactly two critical WOFF2 resources", () => {
    const fontFiles = readdirSync(fontDirectory)
      .filter((file) => file.endsWith(".woff2"))
      .sort();
    const totalBytes = fontFiles.reduce(
      (bytes, file) => bytes + statSync(join(fontDirectory, file)).size,
      0,
    );

    expect(fontFiles).toEqual([
      "fira-sans-condensed-critical.woff2",
      "fira-sans-critical.woff2",
    ]);
    expect(totalBytes).toBeLessThanOrEqual(100 * 1024);
    expect(layoutSource).toContain('from "next/font/local"');
    expect(layoutSource).not.toContain('from "next/font/google"');
    expect(globalNotFoundSource).toContain('from "next/font/local"');
    expect(globalNotFoundSource).not.toContain('from "next/font/google"');
    expect(globalNotFoundSource).toContain("fira-sans-critical.woff2");
    expect(globalNotFoundSource).toContain(
      "fira-sans-condensed-critical.woff2",
    );
  });
});
