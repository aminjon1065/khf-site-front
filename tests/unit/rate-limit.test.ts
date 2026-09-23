import { describe, expect, it } from "vitest";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";

// Аудит J-6: лимит частоты для публичных маршрутов, которые ходят в CMS.
// Часы подменяются — проверки не зависят от скорости машины.
function clock(start = 0) {
  let current = start;
  return {
    now: () => current,
    advance: (ms: number) => {
      current += ms;
    },
  };
}

describe("createRateLimiter", () => {
  it("пропускает limit запросов и отказывает следующему с Retry-After", () => {
    const time = clock();
    const limiter = createRateLimiter({
      limit: 60,
      windowMs: 60_000,
      maxKeys: 100,
      now: time.now,
    });

    for (let i = 0; i < 60; i += 1) {
      expect(limiter.consume("203.0.113.7").allowed).toBe(true);
    }

    const denied = limiter.consume("203.0.113.7");
    expect(denied.allowed).toBe(false);
    // 60 в минуту — жетон возвращается раз в секунду.
    expect(denied.retryAfterSeconds).toBe(1);
  });

  it("возвращает право на запрос по мере наполнения ведра, но не больше limit", () => {
    const time = clock();
    const limiter = createRateLimiter({
      limit: 60,
      windowMs: 60_000,
      maxKeys: 100,
      now: time.now,
    });

    for (let i = 0; i < 60; i += 1) {
      limiter.consume("203.0.113.7");
    }
    expect(limiter.consume("203.0.113.7").allowed).toBe(false);

    time.advance(1_000);
    expect(limiter.consume("203.0.113.7").allowed).toBe(true);
    expect(limiter.consume("203.0.113.7").allowed).toBe(false);

    // Долгий простой не копит жетоны сверх limit: всплеск по-прежнему 60.
    time.advance(10 * 60_000);
    let allowed = 0;
    for (let i = 0; i < 100; i += 1) {
      if (limiter.consume("203.0.113.7").allowed) {
        allowed += 1;
      }
    }
    expect(allowed).toBe(60);
  });

  it("отказ не тратит жетон — клиент не загоняет себя в вечный бан", () => {
    const time = clock();
    const limiter = createRateLimiter({
      limit: 2,
      windowMs: 2_000,
      maxKeys: 100,
      now: time.now,
    });

    limiter.consume("a");
    limiter.consume("a");
    for (let i = 0; i < 10; i += 1) {
      expect(limiter.consume("a").allowed).toBe(false);
    }

    time.advance(1_000);
    expect(limiter.consume("a").allowed).toBe(true);
  });

  it("считает клиентов независимо", () => {
    const limiter = createRateLimiter({
      limit: 1,
      windowMs: 60_000,
      maxKeys: 100,
      now: clock().now,
    });

    expect(limiter.consume("203.0.113.7").allowed).toBe(true);
    expect(limiter.consume("203.0.113.7").allowed).toBe(false);
    expect(limiter.consume("198.51.100.23").allowed).toBe(true);
  });

  it("держит память в пределах maxKeys и вытесняет самого давнего клиента", () => {
    const time = clock();
    const limiter = createRateLimiter({
      limit: 1,
      windowMs: 60_000,
      maxKeys: 3,
      now: time.now,
    });

    for (const key of ["a", "b", "c", "d", "e"]) {
      limiter.consume(key);
      time.advance(1);
    }

    expect(limiter.size).toBe(3);
    // «a» и «b» вытеснены: для лимитера они снова новые клиенты…
    expect(limiter.consume("a").allowed).toBe(true);
    // …а «e» ещё помнится и исчерпал свой лимит.
    expect(limiter.consume("e").allowed).toBe(false);
    expect(limiter.size).toBe(3);
  });

  it("первыми вытесняет клиентов с уже полным ведром, а не активных", () => {
    const time = clock();
    const limiter = createRateLimiter({
      limit: 1,
      windowMs: 1_000,
      maxKeys: 2,
      now: time.now,
    });

    limiter.consume("idle");
    time.advance(1_000); // ведро «idle» снова полное
    limiter.consume("active");
    limiter.consume("newcomer");

    expect(limiter.size).toBe(2);
    // «active» исчерпал лимит и не забыт, хотя места не хватало.
    expect(limiter.consume("active").allowed).toBe(false);
  });
});

describe("clientKey", () => {
  const headers = (forwardedFor?: string) =>
    new Headers(
      forwardedFor === undefined ? {} : { "x-forwarded-for": forwardedFor },
    );

  it("берёт последний хоп X-Forwarded-For — тот, что дописал доверенный прокси", () => {
    expect(clientKey(headers("203.0.113.7"))).toBe("203.0.113.7");
    // Левые элементы прислал клиент: подделка не меняет ключ.
    expect(clientKey(headers("10.0.0.1, 1.2.3.4, 203.0.113.7"))).toBe(
      "203.0.113.7",
    );
    expect(clientKey(headers("spoofed, 203.0.113.7 "))).toBe("203.0.113.7");
  });

  it("не доверяет X-Real-IP — nginx его не выставляет", () => {
    expect(
      clientKey(
        new Headers({
          "x-real-ip": "198.51.100.1",
          "x-forwarded-for": "203.0.113.7",
        }),
      ),
    ).toBe("203.0.113.7");
  });

  it("сводит IPv4, отображённый в IPv6, к обычному IPv4", () => {
    expect(clientKey(headers("::ffff:127.0.0.1"))).toBe("127.0.0.1");
  });

  it("сводит IPv6 к сети /64 — перебор адресов абонента не даёт нового лимита", () => {
    const a = clientKey(headers("2001:db8:0:42::1"));
    const b = clientKey(headers("2001:DB8:0:42:ffff:1:2:3"));
    const other = clientKey(headers("2001:db8:0:43::1"));

    expect(a).toBe("2001:db8:0:42::/64");
    expect(b).toBe(a);
    expect(other).not.toBe(a);
    expect(clientKey(headers("[2001:db8::1]"))).toBe("2001:db8:0:0::/64");
    expect(clientKey(headers("64:ff9b::192.0.2.1"))).toBe("64:ff9b:0:0::/64");
    expect(clientKey(headers("::1"))).toBe("0:0:0:0::/64");
  });

  it("без пригодного адреса отдаёт общий ключ unknown", () => {
    expect(clientKey(headers())).toBe("unknown");
    expect(clientKey(headers(""))).toBe("unknown");
    expect(clientKey(headers("203.0.113.7, not-an-ip"))).toBe("unknown");
    expect(clientKey(headers("999.1.1.1"))).toBe("unknown");
    expect(clientKey(headers("1::2::3"))).toBe("unknown");
    expect(clientKey(headers("1:2:3:4:5:6:7:8:9"))).toBe("unknown");
    expect(clientKey(headers(`2001:db8::${"1".repeat(100)}`))).toBe("unknown");
  });
});
