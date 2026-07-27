# Lighthouse budgets — E-1 (PROJECT_PLAN.md)

Budget: performance >= 90, accessibility >= 95 (mobile).

Last run: 2026-07-27T02:49:35.344Z

| Page | URL | Performance | Accessibility | Status |
|---|---|---|---|---|
| home | `/ru` | 86 | 95 | ❌ |
| news-list | `/ru/news` | 88 | 95 | ❌ |
| news-article | `/ru/news/ucheniya-po-grazhdanskoy-oborone-v-sogdiyskoy-oblasti` | 89 | 94 | ❌ |
| risk-map | `/ru/map` | 86 | 94 | ❌ |

Regenerate: `node scripts/lighthouse-budgets.mjs [baseUrl]` against a running server (`npm run build && npm run start`, matches production more closely than `npm run dev`).
