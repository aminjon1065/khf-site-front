import { describe, expect, it } from "vitest";
import {
  htmlLang,
  stripLocale,
  toApiLocale,
  toLocale,
  withLocale,
} from "@/lib/i18n/config";

describe("locale boundary helpers", () => {
  it("maps the public Tajik locale to the CMS and HTML standard", () => {
    expect(toApiLocale("tj")).toBe("tg");
    expect(htmlLang("tj")).toBe("tg");
    expect(toApiLocale("ru")).toBe("ru");
    expect(htmlLang("en")).toBe("en");
  });

  it("falls back to Russian for unsupported locale input", () => {
    expect(toLocale("de")).toBe("ru");
    expect(toLocale(undefined)).toBe("ru");
  });

  it("adds and replaces locale prefixes without touching external links", () => {
    expect(withLocale("tj", "/news/test")).toBe("/tj/news/test");
    expect(withLocale("en", "/ru/news/test")).toBe("/ru/news/test");
    expect(withLocale("en", "https://example.com")).toBe("https://example.com");
    expect(stripLocale("/ru/news/test")).toBe("/news/test");
    expect(stripLocale("/tj")).toBe("/");
  });
});
