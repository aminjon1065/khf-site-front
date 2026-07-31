import { describe, expect, it } from "vitest";
import { devEnv, mkcertRootCa } from "../../scripts/dev.mjs";

// Регрессия на реальный симптом: CMS отдаётся по https с сертификатом mkcert,
// Node ему не доверяет, серверные fetch падают с UNABLE_TO_VERIFY_LEAF_SIGNATURE,
// и сайт молча рендерится пустым, как будто CMS недоступна.

describe("mkcertRootCa", () => {
  const ok = () => ({ status: 0, stdout: "/home/user/.local/share/mkcert\n" });

  it("возвращает путь к rootCA.pem, когда mkcert установлен", () => {
    const pem = mkcertRootCa({ run: ok, exists: () => true });

    expect(pem).toMatch(/rootCA\.pem$/);
    expect(pem).toContain("mkcert");
  });

  it("возвращает null, когда mkcert есть, но сертификата нет", () => {
    expect(mkcertRootCa({ run: ok, exists: () => false })).toBeNull();
  });

  it("возвращает null, когда mkcert не установлен", () => {
    const missing = () => ({ status: 1, stdout: "" });

    expect(mkcertRootCa({ run: missing, exists: () => true })).toBeNull();
  });

  it("не падает, когда запуск mkcert выбрасывает ошибку", () => {
    const throws = () => {
      throw new Error("ENOENT");
    };

    expect(mkcertRootCa({ run: throws, exists: () => true })).toBeNull();
  });
});

describe("devEnv", () => {
  it("подставляет NODE_EXTRA_CA_CERTS, когда локальный CA найден", () => {
    const env = devEnv({ PATH: "/usr/bin" }, () => "/ca/rootCA.pem");

    expect(env.NODE_EXTRA_CA_CERTS).toBe("/ca/rootCA.pem");
    expect(env.PATH).toBe("/usr/bin");
  });

  it("не трогает уже заданное снаружи значение", () => {
    const env = devEnv(
      { NODE_EXTRA_CA_CERTS: "/custom/ca.pem" },
      () => "/ca/rootCA.pem",
    );

    expect(env.NODE_EXTRA_CA_CERTS).toBe("/custom/ca.pem");
  });

  it("оставляет окружение как есть, когда mkcert не найден (Windows/CI/прод)", () => {
    const env = devEnv({ PATH: "/usr/bin" }, () => null);

    expect(env).not.toHaveProperty("NODE_EXTRA_CA_CERTS");
  });
});
