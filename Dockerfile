# syntax=docker/dockerfile:1.7
#
# Публичный сайт КЧС для одного сервера в Docker (стек — в репозитории CMS:
# deploy/docker/compose.yml).
#
# Сборка ходит в CMS: страницы пререндерятся с настоящими данными, а
# `CMS_BUILD_MODE=production` роняет сборку, если CMS не отвечает, — пустой
# релиз (все страницы «данные недоступны») не должен уехать на сервер.
# Поэтому API_URL сборки — публичный адрес CMS, а не внутренний: во время
# `docker build` сети стека ещё нет.

ARG NODE_IMAGE=node:22-trixie-slim

FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM deps AS build
COPY . .
# NEXT_PUBLIC_* вшиваются в клиентский код при сборке: смена домена —
# это пересборка образа, а не правка окружения контейнера.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_RUM_SAMPLE_RATE=0.1
ARG API_URL
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    CMS_BUILD_MODE=production \
    NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_RUM_SAMPLE_RATE=${NEXT_PUBLIC_RUM_SAMPLE_RATE} \
    API_URL=${API_URL}
# Ключ сервера сайта (SITE_API_KEY) — BuildKit secret, а не ARG: пререндер
# тысяч страниц не должен упереться в лимит API по IP, но ключу не место в
# истории образа. Без секрета сборка идёт под общим лимитом.
RUN --mount=type=secret,id=site_api_key,required=false \
    SITE_API_KEY="$(cat /run/secrets/site_api_key 2>/dev/null || true)" npm run build \
    && npm prune --omit=dev --no-audit --no-fund

FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
WORKDIR /app
COPY --from=build --chown=node:node /app ./
USER node
EXPOSE 3000
# Живость — та же главная, что видят люди: ответ 200 значит, что Node жив и
# рендерит; сбой CMS сайт переживает сам (страницы из кэша), поэтому
# проверка от неё не зависит.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/ru',{method:'HEAD'}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "node_modules/next/dist/bin/next", "start"]
