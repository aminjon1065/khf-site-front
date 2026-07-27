# Lighthouse budgets — E-1 (PROJECT_PLAN.md)

Budget: performance >= 90, accessibility >= 95 (mobile).

Last run: 2026-07-27T06:46:00.000Z

| Page | URL | Performance | Accessibility | Status |
|---|---|---|---|---|
| home | `/ru` | 87 | 98 | ❌ |
| news-list | `/ru/news` | 91 | 98 | ✅ |
| news-article | `/ru/news/bolee-4-000-zhiteley-gbao-proshli-obuchenie-deystviyam-pri-lavinnoy-opasnosti` | 92 | 98 | ✅ |
| risk-map | `/ru/map` | 91 | 98 | ✅ |

Regenerate: `node scripts/lighthouse-budgets.mjs [baseUrl]` against a running server (`npm run build && npm run start`, matches production more closely than `npm run dev`).
