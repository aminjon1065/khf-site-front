# Lighthouse budgets — E-1 (PROJECT_PLAN.md)

Budget: performance >= 90, accessibility >= 95 (mobile).

Last run: 2026-09-16T07:04:04.697Z

| Page | URL | Performance | Accessibility | Status |
|---|---|---|---|---|
| home | `/ru` | 88 | 100 | ❌ |
| news-list | `/ru/news` | 98 | 100 | ✅ |
| news-article | `/ru/news/novosti-testovaya` | 98 | 100 | ✅ |
| risk-map | `/ru/map` | 97 | 100 | ✅ |

Regenerate: `node scripts/lighthouse-budgets.mjs [baseUrl]` against a running server (`npm run build && npm run start`, matches production more closely than `npm run dev`).

## Условия замера

- Хост: 28 логических ядер, свободно 0.7 ГБ из 31.7 ГБ.
- Цель: `http://localhost:3000`, mobile, throttlingMethod=devtools.

Оценка Performance — лабораторная и чувствительна к загрузке машины:
на занятом хосте разброс между прогонами достигает ±5 пунктов, поэтому
одиночный прогон не доказывает ни улучшения, ни регрессии. Сравнивать
изменения надёжнее по устойчивым метрикам (CLS, объём загруженных
ресурсов) и по нескольким прогонам в одинаковых условиях. Полевые данные
(p75 по CrUX/RUM) эта таблица не заменяет.
