import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("public header client boundary", () => {
  it("keeps the header shell on the server", () => {
    const source = readFileSync(
      join(root, "components/public/PublicHeader.tsx"),
      "utf8",
    );

    expect(source).not.toMatch(/^["']use client["'];/);
    expect(source).not.toContain("useState");
    expect(source).not.toContain("useEffect");
    expect(source).not.toContain("usePathname");
    expect(source).not.toContain("useRouter");
  });

  it.each(["ThemeToggle", "LocaleSwitcher", "MobileMenuButton"])(
    "isolates %s behind an explicit client boundary",
    (component) => {
      const source = readFileSync(
        join(root, `components/public/header/${component}.tsx`),
        "utf8",
      );

      expect(source).toMatch(/^["']use client["'];/);
    },
  );
});
