# Lighthouse budgets — E-1 (PROJECT_PLAN.md)

Budget: performance >= 90, accessibility >= 95 (mobile).

Last run: 2026-08-22T17:28:12.731Z

| Page | URL | Performance | Accessibility | Status |
|---|---|---|---|---|
| home | `/ru` | 90 | 100 | ✅ |
| news-list | `/ru/news` | 98 | 100 | ✅ |
| news-article | `/ru/news/test-news` | 97 | 100 | ✅ |
| risk-map | `/ru/map` | 99 | 100 | ✅ |

Regenerate: `node scripts/lighthouse-budgets.mjs [baseUrl]` against a running server (`npm run build && npm run start`, matches production more closely than `npm run dev`).
