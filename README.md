# khf-site-front

Публичный сайт Комитета по чрезвычайным ситуациям Республики Таджикистан (khf.tj). Next.js 16 (App Router, Turbopack) + React 19, три локали (`/ru` `/tj` `/en`), SSR/ISR. Весь контент приходит из read-only API административной панели — [`khf-site-cms`](../khf-site-cms) (Laravel). У этого фронта нет собственной базы данных.

План работ и реестр известных проблем — в `khf-site-cms/PROJECT_PLAN.md` (общий для обоих репозиториев, см. `docs/PROJECT_PLAN.md`).

> **Next.js 16 отличается от того, что вы, возможно, помните.** Перед правкой роутинга, кэширования, метаданных, `not-found` или proxy — читайте `node_modules/next/dist/docs/`, а не полагайтесь на память. Подробности в `AGENTS.md`.

## Стек

- Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4.
- Vitest + Testing Library — юнит-тесты (`tests/unit`).
- Playwright — e2e (`tests/e2e`).
- Данные — только через `lib/api.ts` → `khf-site-cms` `/api/v1`.

## Запуск

Оба репозитория (`khf-site-cms`, `khf-site-front`) обычно лежат рядом и поднимаются одновременно — фронт без работающей CMS покажет только статичные части интерфейса (см. «Мягкая деградация» ниже).

```bash
npm ci
cp .env.example .env.local   # затем раскомментировать нужный блок, см. ниже
npm run dev                  # http://localhost:3000
```

### Windows / Laragon

CMS обычно поднята на `http://127.0.0.1:8848` (`php artisan serve --port=8848`). В `.env.local` раскомментируйте блок Laragon (порт `8848`) — он включён по умолчанию в `.env.example`.

### macOS / Laravel Herd

Herd отдаёт CMS по домену `<папка-проекта>.test` (обычно `khf-site-cms.test`), без порта. В `.env.local` раскомментируйте блок Herd и закомментируйте блок Laragon. Используйте `http://`, не `https://` — иначе серверный `fetch` Next.js упрётся в локальный TLS-сертификат Herd.

Скрипт `dev:mkcert` (`NODE_EXTRA_CA_CERTS=$(mkcert -CAROOT)/rootCA.pem next dev`) нужен только если CMS поднята по `https://` с сертификатом от `mkcert`; в обычной Laragon/Herd-настройке (`http://`) достаточно `npm run dev`.

## Переменные окружения

См. `.env.example` — там же комментарии по каждой машине. Коротко:

| Переменная | Назначение |
|---|---|
| `API_URL` | база API CMS для серверных вызовов (SSR/ISR) |
| `NEXT_PUBLIC_API_URL` | та же база для клиентских вызовов (поиск, форма обращений) — должна быть доступна из браузера и разрешена в `CORS_ALLOWED_ORIGINS` на стороне CMS |
| `REVALIDATION_SECRET` | секрет для входящего вебхука `/api/revalidate`; должен побуквенно совпадать с `FRONTEND_REVALIDATION_SECRET` в `.env` CMS |
| `NEXT_PUBLIC_SITE_URL` | публичный адрес сайта — canonical, OpenGraph, hreflang, `sitemap.xml` |

## Локали: `tj` в URL, `tg` в API — не одно и то же

В адресной строке и интерфейсе таджикский язык обозначается **`tj`** (исторически, как в макетах и ccTLD страны). Бэкенд/CMS и `<html lang>` используют стандартный ISO-код **`tg`**. Маппинг живёт в одном месте — `lib/i18n/config.ts` (`toApiLocale`, `htmlLang`) — и вызывается на границе с API автоматически; в остальном коде эти два кода не путать руками.

**При отладке API всегда `curl '.../api/v1/news?locale=tg'`.** `?locale=tj` не ошибка, а тихий откат на русский (`ResolveApiLocale::SUPPORTED = ['tg','ru','en']` на стороне CMS) — легко принять пустой/русский ответ за «таджикский не работает».

Это осознанное архитектурное решение (см. `PROJECT_PLAN.md`), а не что-то, что нужно «исправить» унификацией.

## Откуда страница берёт данные

Все функции — в `lib/api.ts`. Список нужен для отладки: если страница показывает не то, сначала проверяйте ответ соответствующего эндпоинта CMS напрямую (`curl`), а не React-код.

| Страница | Функция(и) | Эндпоинт CMS |
|---|---|---|
| `/[locale]` (главная) | `fetchHome` | `GET /home` |
| `/[locale]/news`, `/news/[slug]` | `fetchNews`, `fetchNewsItem` | `GET /news`, `GET /news/{slug}` |
| `/[locale]/guides`, `/guides/[slug]` | `fetchInstructions`, `fetchInstruction` | `GET /instructions`, `GET /instructions/{slug}` |
| `/[locale]/documents` | `fetchDocuments` | `GET /documents` |
| `/[locale]/projects`, `/projects/[slug]` | `fetchProjects`, `fetchProject` | `GET /projects`, `GET /projects/{slug}` |
| `/[locale]/announcements` | `fetchAnnouncements` | `GET /announcements` |
| `/[locale]/alerts`, `/alerts/[slug]` | `fetchAlerts`, `fetchAlert`, `fetchAlertsActive` | `GET /alerts`, `GET /alerts/{slug}`, `GET /alerts/active` |
| `/[locale]/map` | `fetchRegions`, `fetchAlertsActive` | `GET /regions`, `GET /alerts/active` |
| `/[locale]/search` | `fetchSearch` | `GET /search` |
| `/[locale]/contacts` | `fetchRegionsDirectory`, `fetchSettings` | `GET /regions/directory`, `GET /settings` |
| `/[locale]/pages/[slug]`, `/sitemap` | `fetchPages`, `fetchPage` | `GET /pages`, `GET /pages/{slug}` |
| Шапка / подвал / меню (во всех layout) | `fetchSettings`, `fetchMenu` | `GET /settings`, `GET /menu` |
| `/leadership`, `/structure`, `/symbols`, `/sos` | — (статика в `lib/copy/`) | — (см. C-1 в плане: решение — оставить в коде) |

Данные кэшируются через ISR (`revalidate = 60` c, тег `cms`) и инвалидируются мгновенно вебхуком при публикации в CMS (см. ниже). Правка `Setting`/`Menu` и прочих справочников без работающего вебхука не появится на сайте до `next build` или до истечения 60 секунд.

## Ревалидация по вебхуку

При публикации/обновлении материала CMS шлёт `POST /api/revalidate` с `Authorization: Bearer <REVALIDATION_SECRET>`; обработчик (`app/api/revalidate`) вызывает `revalidateTag("cms", "max")` (двухаргументная форма — так требует Next 16). Секрет должен совпадать в обоих `.env`. Без него вебхук просто не настроен — сайт по-прежнему работает через обычный ISR-таймер.

## Мягкая деградация

Каждая функция в `lib/api.ts` ловит сетевые ошибки и не роняет страницу: списки рендерятся пустыми (с человекочитаемым текстом), а не белым экраном; шапка/подвал используют статичный fallback, если `/settings`/`/menu` недоступны. Функции для одиночного материала (`fetchNewsItem` и т.п.) — исключение: 404 от API даёт `null` → `notFound()`, а 5xx/сетевая ошибка **пробрасывается** дальше, чтобы Next отдал последний удачный статический рендер или error boundary, а не закэшировал ложный 404.

## Тесты

```bash
npm test        # Vitest: tests/unit — чистые функции (i18n, seo, api.ts, словари)
npm run test:e2e # Playwright: tests/e2e — локали, редиректы, переключатель языка, поиск, 404
```

`test:e2e` сам поднимает сервер (`playwright.config.ts` → `webServer`): в CI — `npm run build && npm run start` (сборка уже отдельный шаг), локально — `npm run dev`, с переиспользованием уже запущенного на `:3000`.

## Структура

```
app/[locale]/…      маршруты (App Router), по одному каталогу на раздел
components/public/   компоненты публичного сайта (шапка, подвал, карточки…)
components/i18n/     обёртки над next/link и т.п. с учётом префикса локали
lib/api.ts           весь доступ к API CMS — единственное место, которое знает про /api/v1
lib/i18n/            локали, словари интерфейса (ru/tj/en), маппинг tj↔tg
lib/seo.ts           canonical + hreflang + OpenGraph/Twitter
lib/copy/            статичные тексты (там, где контент не редактируется в CMS)
proxy.ts             определение локали по cookie/Accept-Language, редирект (Next 16 — это бывший middleware)
tests/unit, tests/e2e тесты (см. выше)
```

## Пакетный менеджер

Только `npm` (`package-lock.json`) — тот же, что использует CI обоих репозиториев. `yarn`/`pnpm` не используются, лишние lock-файлы удалять сразу, если появятся.

## Полезные ссылки

- [Next.js Docs](https://nextjs.org/docs) — но сверяйтесь с версией из `node_modules/next/dist/docs/`, публичная документация может описывать другую версию.
- [Vitest](https://vitest.dev/guide/), [Playwright](https://playwright.dev/docs/intro).
