import { describe, expect, it } from "vitest";
import { isSafeExternalUrl } from "@/lib/url-safety";

describe("isSafeExternalUrl", () => {
  it("accepts http and https URLs", () => {
    expect(isSafeExternalUrl("https://jobs.example.tj/apply")).toBe(true);
    expect(isSafeExternalUrl("http://example.com")).toBe(true);
  });

  it("rejects null/undefined/empty", () => {
    expect(isSafeExternalUrl(null)).toBe(false);
    expect(isSafeExternalUrl(undefined)).toBe(false);
    expect(isSafeExternalUrl("")).toBe(false);
  });

  it("rejects dangerous or non-http(s) schemes", () => {
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isSafeExternalUrl("mailto:info@khf.tj")).toBe(false);
    expect(isSafeExternalUrl("tel:+992372215900")).toBe(false);
    expect(isSafeExternalUrl("file:///etc/passwd")).toBe(false);
  });

  it("rejects malformed/relative strings that are not absolute URLs", () => {
    expect(isSafeExternalUrl("not a url")).toBe(false);
    expect(isSafeExternalUrl("/relative/path")).toBe(false);
  });
});
