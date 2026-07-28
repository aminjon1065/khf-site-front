import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return sourceFiles(path);
    }

    return [".jsx", ".tsx"].includes(extname(entry.name)) ? [path] : [];
  });
}

describe("public image pipeline", () => {
  it("does not bypass next/image with raw img elements", () => {
    const rawImageSources = ["app", "components"]
      .flatMap(sourceFiles)
      .filter((path) => /<img\b/.test(readFileSync(path, "utf8")));

    expect(rawImageSources).toEqual([]);
  });
});
