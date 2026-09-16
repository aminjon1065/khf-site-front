import { describe, expect, it } from "vitest";
import {
  cmsRequestTags,
  isAddressableSlug,
  MAX_CMS_SLUG_LENGTH,
  parseRevalidationPayload,
  buildRevalidationTags,
} from "@/lib/cache-tags";

// Регрессия на реальный отказ production-сборки.
//
// В CMS появился материал со slug'ом в 247 символов. Следствия, все три
// молчаливые до самого падения:
//   1. имя файла `.next/server/app/ru/news/<slug>.segments` — 256 символов,
//      а предел компонента пути — 255 БАЙТ и в NTFS, и в ext4. `next build`
//      падал с ENOENT на mkdir, то есть один материал ронял выкладку;
//   2. тег кэша `cms:news:<slug>:ru` — 259 символов при лимите Next.js 256,
//      и адресная ревалидация для материала просто не работала;
//   3. входящий вебхук с таким slug'ом и так отвергался (проверка ≤180).
//
// Настоящее исправление — ограничение длины slug на стороне CMS
// (docs/CMS_CONTRACT_REQUESTS.md). Здесь — защита фронта: длинный slug
// остаётся рабочим адресом, но не участвует в прегенерации и адресных тегах.

const LONG_SLUG = "a".repeat(MAX_CMS_SLUG_LENGTH + 1);
const MAX_SLUG = "a".repeat(MAX_CMS_SLUG_LENGTH);

describe("isAddressableSlug", () => {
  it("принимает slug ровно на границе контракта", () => {
    expect(isAddressableSlug(MAX_SLUG)).toBe(true);
  });

  it("отвергает slug длиннее контракта", () => {
    expect(isAddressableSlug(LONG_SLUG)).toBe(false);
  });

  it("отвергает пустой slug — это не адрес", () => {
    expect(isAddressableSlug("")).toBe(false);
  });

  it("держит границу заведомо ниже предела имени файла (255 байт)", () => {
    // `.segments` — самый длинный суффикс, который Next дописывает к slug'у.
    expect(MAX_CMS_SLUG_LENGTH + ".prefetch.rsc".length).toBeLessThan(255);
  });
});

describe("cmsRequestTags", () => {
  it("добавляет адресный тег материала при нормальном slug'е", () => {
    expect(cmsRequestTags("news", "ru", "spasateli-evakuirovali")).toEqual([
      "cms:news:ru",
      "cms:news:spasateli-evakuirovali:ru",
    ]);
  });

  it("опускает адресный тег, который Next.js всё равно отверг бы по длине", () => {
    const tags = cmsRequestTags("news", "ru", LONG_SLUG);

    expect(tags).toEqual(["cms:news:ru"]);
    // Главное свойство: ни один переданный тег не длиннее лимита Next.js,
    // иначе отвергается весь набор, а не только длинный тег.
    expect(tags.every((tag) => tag.length <= 256)).toBe(true);
  });

  it("любой тег самого длинного ресурса укладывается в лимит", () => {
    // `announcements` — самый длинный сегмент в RESOURCE_BY_TYPE.
    const tags = cmsRequestTags("announcement", "ru", MAX_SLUG);

    expect(tags.every((tag) => tag.length <= 256)).toBe(true);
  });
});

describe("контракт вебхука согласован с границей slug'а", () => {
  it("payload с допустимым slug'ом принимается", () => {
    const slug = MAX_SLUG;
    const payload = {
      type: "news" as const,
      id: 1,
      slug,
      locales: ["ru" as const],
      event: "published",
      tags: buildRevalidationTags("news", slug, ["ru"]),
    };

    expect(parseRevalidationPayload(payload)).not.toBeNull();
  });

  it("payload со slug'ом длиннее границы отвергается", () => {
    const payload = {
      type: "news" as const,
      id: 1,
      slug: LONG_SLUG,
      locales: ["ru" as const],
      event: "published",
      tags: buildRevalidationTags("news", LONG_SLUG, ["ru"]),
    };

    expect(parseRevalidationPayload(payload)).toBeNull();
  });
});
