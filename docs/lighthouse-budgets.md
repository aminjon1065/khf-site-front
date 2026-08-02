# Lighthouse budgets — E-1 (PROJECT_PLAN.md)

Budget: performance >= 90, accessibility >= 95 (mobile).

Last run: 2026-08-02T12:33:40.709Z

| Page | URL | Performance | Accessibility | Status |
|---|---|---|---|---|
| home | `/ru` | 99 | 100 | ✅ |
| news-list | `/ru/news` | 99 | 100 | ✅ |
| news-article | `/ru/news/test-news` | 99 | 100 | ✅ |
| risk-map | `/ru/map` | 99 | 100 | ✅ |

Regenerate: `node scripts/lighthouse-budgets.mjs [baseUrl]` against a running server (`npm run build && npm run start`, matches production more closely than `npm run dev`).
