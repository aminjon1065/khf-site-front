import { describe, expect, it } from "vitest";
import {
  htmlLang,
  isLocale,
  localeFromPathname,
  stripLocale,
  toApiLocale,
  toLocale,
  withLocale,
} from "@/lib/i18n/config";

describe("toApiLocale", () => {
  it("maps the Tajik URL locale to the ISO API locale", () => {
    expect(toApiLocale("tj")).toBe("tg");
  });

  it("passes ru/en through unchanged", () => {
    expect(toApiLocale("ru")).toBe("ru");
    expect(toApiLocale("en")).toBe("en");
  });
});

describe("htmlLang", () => {
  it("uses the canonical tg code for the Tajik locale", () => {
    expect(htmlLang("tj")).toBe("tg");
  });

  it("passes ru/en through unchanged", () => {
    expect(htmlLang("ru")).toBe("ru");
    expect(htmlLang("en")).toBe("en");
  });
});

describe("isLocale / toLocale", () => {
  it("accepts only the three supported locales", () => {
    expect(isLocale("ru")).toBe(true);
    expect(isLocale("tj")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("tg")).toBe(false);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale(null)).toBe(false);
  });

  it("falls back to the default locale for garbage input", () => {
    expect(toLocale("fr")).toBe("ru");
    expect(toLocale(undefined)).toBe("ru");
    expect(toLocale(null)).toBe("ru");
    expect(toLocale("")).toBe("ru");
  });

  it("keeps a valid locale as-is", () => {
    expect(toLocale("tj")).toBe("tj");
    expect(toLocale("en")).toBe("en");
  });
});

describe("localeFromPathname", () => {
  it("reads the locale from the first path segment", () => {
    expect(localeFromPathname("/tj/news")).toBe("tj");
    expect(localeFromPathname("/en")).toBe("en");
  });

  it("falls back to the default locale when the segment is not a locale", () => {
    expect(localeFromPathname("/news")).toBe("ru");
    expect(localeFromPathname("/")).toBe("ru");
  });
});

describe("withLocale", () => {
  it("prefixes an internal path with the current locale", () => {
    expect(withLocale("ru", "/news")).toBe("/ru/news");
    expect(withLocale("tj", "/")).toBe("/tj");
  });

  it("does not double-prefix an already-localized path", () => {
    expect(withLocale("en", "/ru/news")).toBe("/ru/news");
  });

  it("leaves external and protocol-relative links untouched", () => {
    expect(withLocale("ru", "https://example.com")).toBe("https://example.com");
    expect(withLocale("ru", "//example.com")).toBe("//example.com");
    expect(withLocale("ru", "mailto:info@khf.tj")).toBe("mailto:info@khf.tj");
    expect(withLocale("ru", "tel:+992372215900")).toBe("tel:+992372215900");
    expect(withLocale("ru", "#section")).toBe("#section");
  });
});

describe("stripLocale", () => {
  it("removes the locale prefix", () => {
    expect(stripLocale("/tj/news")).toBe("/news");
    expect(stripLocale("/ru/news/some-slug")).toBe("/news/some-slug");
  });

  it("collapses the locale root to /", () => {
    expect(stripLocale("/en")).toBe("/");
  });

  it("returns unlocalized paths as-is", () => {
    expect(stripLocale("/news")).toBe("/news");
  });

  it("strips a trailing slash", () => {
    expect(stripLocale("/ru/news/")).toBe("/news");
  });
});
