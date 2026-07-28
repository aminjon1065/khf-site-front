import { describe, expect, it } from "vitest";
import { muted } from "@/components/public/muted";

describe("muted text color", () => {
  it("keeps text at or above the accessible contrast floor", () => {
    expect(muted(50)).toContain("70%");
    expect(muted(70)).toContain("70%");
    expect(muted(80)).toContain("80%");
    expect(muted(120)).toContain("100%");
  });
});
