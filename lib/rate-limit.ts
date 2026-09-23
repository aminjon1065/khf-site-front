// Ограничение частоты запросов в памяти процесса (аудит J-6).
//
// Нужен там, где публичный запрос сайта порождает работу на стороне CMS: без
// лимита любой желающий превращал фронт в усилитель нагрузки на неё. Лимит
// живёт в памяти одного процесса `next start` — внешнего хранилища у сайта
// нет, а для цели «не дать фронту завалить CMS» этого достаточно.

export interface RateLimitDecision {
  allowed: boolean;
  /** Через сколько секунд клиенту снова можно прийти (для `Retry-After`). */
  retryAfterSeconds: number;
}

export interface RateLimiter {
  /** Списывает один запрос клиента `key` и сообщает, пропускать ли его. */
  consume(key: string): RateLimitDecision;
  /** Сколько клиентов лимитер сейчас помнит — не больше `maxKeys`. */
  readonly size: number;
}

export interface RateLimiterOptions {
  /** Сколько запросов разрешено за окно (и максимальный всплеск). */
  limit: number;
  /** Длина окна, мс. */
  windowMs: number;
  /** Верхняя граница памяти: сколько клиентов помнить одновременно. */
  maxKeys: number;
  /** Часы — подменяются в тестах. */
  now?: () => number;
}

interface Bucket {
  tokens: number;
  updatedAt: number;
}

/**
 * «Ведро с жетонами»: у клиента до `limit` жетонов, каждый запрос тратит
 * один, за `windowMs` ведро наполняется целиком. В среднем это `limit`
 * запросов за окно с допустимым всплеском в `limit` — без двойного всплеска
 * на стыке окон, который даёт простой счётчик по минутам.
 *
 * Память ограничена `maxKeys`: `Map` хранит клиентов в порядке последнего
 * обращения, поэтому при заполнении сначала выбрасываются давние клиенты с уже
 * полным ведром (для лимита они неотличимы от новых), а если места всё равно
 * нет — самый давний из оставшихся.
 */
export function createRateLimiter({
  limit,
  windowMs,
  maxKeys,
  now = Date.now,
}: RateLimiterOptions): RateLimiter {
  const refillPerMs = limit / windowMs;
  const buckets = new Map<string, Bucket>();

  const tokensAt = (bucket: Bucket, at: number): number =>
    Math.min(limit, bucket.tokens + (at - bucket.updatedAt) * refillPerMs);

  function makeRoom(at: number): void {
    for (const [key, bucket] of buckets) {
      if (buckets.size < maxKeys || tokensAt(bucket, at) < limit) {
        break;
      }
      buckets.delete(key);
    }
    while (buckets.size >= maxKeys) {
      const oldest = buckets.keys().next();
      if (oldest.done) {
        break;
      }
      buckets.delete(oldest.value);
    }
  }

  return {
    consume(key: string): RateLimitDecision {
      const at = now();
      const known = buckets.get(key);
      let tokens: number;

      if (known) {
        tokens = tokensAt(known, at);
        // Удаление и повторная вставка переносят клиента в конец очереди.
        buckets.delete(key);
      } else {
        makeRoom(at);
        tokens = limit;
      }

      if (tokens >= 1) {
        buckets.set(key, { tokens: tokens - 1, updatedAt: at });
        return { allowed: true, retryAfterSeconds: 0 };
      }

      buckets.set(key, { tokens, updatedAt: at });
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((1 - tokens) / refillPerMs / 1000),
        ),
      };
    },
    get size(): number {
      return buckets.size;
    },
  };
}

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const IPV6_GROUP = /^[0-9a-f]{1,4}$/;

function isIpv4(value: string): boolean {
  const match = IPV4.exec(value);
  return match !== null && match.slice(1).every((part) => Number(part) <= 255);
}

/**
 * Сеть /64 IPv6-адреса: столько обычно выдают одному абоненту, и перебор
 * адресов внутри неё не должен давать новый лимит. `null` — не IPv6.
 */
function ipv6Network(value: string): string | null {
  const address = value.split("%")[0] ?? "";
  const halves = address.split("::");
  if (halves.length > 2) {
    return null;
  }

  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  // Встроенный IPv4 в конце (`64:ff9b::192.0.2.1`) занимает две группы; на
  // сеть /64 он не влияет, важно только правильно посчитать группы.
  const last = tail.length > 0 ? tail : head;
  const embedded = last[last.length - 1];
  if (embedded?.includes(".")) {
    if (!isIpv4(embedded)) {
      return null;
    }
    last.splice(last.length - 1, 1, "0", "0");
  }

  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 ? missing !== 0 : missing < 1) {
    return null;
  }

  const groups = [...head, ...Array<string>(missing).fill("0"), ...tail];
  if (!groups.every((group) => IPV6_GROUP.test(group))) {
    return null;
  }

  const network = groups
    .slice(0, 4)
    .map((group) => Number.parseInt(group, 16).toString(16))
    .join(":");
  return `${network}::/64`;
}

/** Нормализованный адрес клиента или `null`, если это не IP-адрес. */
function normalizeClientAddress(raw: string): string | null {
  let value = raw.trim().toLowerCase();
  if (value.startsWith("[") && value.endsWith("]")) {
    value = value.slice(1, -1);
  }
  // Ключи лимитера лежат в памяти: длинную строку в ключ не пускаем.
  if (value.length === 0 || value.length > 64) {
    return null;
  }

  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(value);
  if (mapped) {
    value = mapped[1];
  }

  return isIpv4(value) ? value : ipv6Network(value);
}

/**
 * Ключ клиента для лимита — адрес, который видел ближайший к приложению
 * доверенный хоп.
 *
 * Перед сайтом стоит один nginx (khf-site-cms/DEPLOYMENT.md, «Nginx-прокси на
 * порт 3000»): он дописывает адрес соединения в конец X-Forwarded-For
 * (`$proxy_add_x_forwarded_for`). Без прокси то же поле заполняет сам
 * `next start` — адресом сокета, если клиент заголовок не прислал. Значит,
 * доверять можно только последнему элементу: всё, что левее, прислал клиент
 * и подделает бесплатно. X-Real-IP не читается: nginx его не выставляет, и
 * клиентское значение прошло бы насквозь.
 *
 * Без пригодного адреса — общий ключ `unknown`: такие запросы делят один
 * лимит, а не получают каждый свой.
 */
export function clientKey(headers: Headers): string {
  const hops = (headers.get("x-forwarded-for") ?? "").split(",");
  return normalizeClientAddress(hops[hops.length - 1] ?? "") ?? "unknown";
}
