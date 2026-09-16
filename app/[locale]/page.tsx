import Link from "@/components/i18n/LocaleLink";
import {
  Activity,
  Flame,
  Mountain,
  MountainSnow,
  ShieldAlert,
  Snowflake,
  ThermometerSun,
  TriangleAlert,
  Waves,
  Wind,
} from "lucide-react";
import PageShell from "@/components/public/PageShell";
import CmsImage from "@/components/public/CmsImage";
import { SectionHeader, ImageSlot, muted } from "@/components/public/ui";
import NewsSlider from "@/components/public/NewsSlider";
import RefreshOnVisible from "@/components/public/RefreshOnVisible";
import TjRiskMap from "@/components/public/TjRiskMap";
import { EMPTY_HOME, fetchHome, type ApiAlert } from "@/lib/api";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { routes } from "@/lib/routes";
import { cmsImageSource } from "@/lib/media";
import {
  legendItems,
  levelBadges,
  levelDotColor,
  levelMapFill,
} from "@/lib/levels";
import type { AlertLevel, RegionStatus } from "@/lib/types";

export const revalidate = 60;

/** Иконка малой плитки «быстрых действий». */
/**
 * Иконка типа опасности. `hazard_icon` в API — закрытый перечень имён Lucide,
 * поэтому компоненты импортируются поимённо (дерево тряхнётся) вместо
 * динамического импорта всей библиотеки. Неизвестное или пустое значение
 * даёт нейтральный знак, а не пустоту в вёрстке.
 */
const HAZARD_ICONS = {
  activity: Activity,
  flame: Flame,
  mountain: Mountain,
  "mountain-snow": MountainSnow,
  snowflake: Snowflake,
  "thermometer-sun": ThermometerSun,
  waves: Waves,
  wind: Wind,
} as const;

function HazardIcon({
  name,
  size = 22,
  tone = "var(--color-accent-700)",
}: {
  name: string | null;
  size?: number;
  tone?: string;
}) {
  const Icon =
    (name && HAZARD_ICONS[name as keyof typeof HAZARD_ICONS]) || ShieldAlert;

  return (
    <Icon size={size} strokeWidth={1.5} aria-hidden="true" style={{ color: tone }} />
  );
}

function QuickIcon({ name }: { name: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--color-accent-700)",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "waves":
      return (
        <svg {...common}>
          <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        </svg>
      );
    case "aid":
      return (
        <svg {...common}>
          <path d="M8 3.1V7a4 4 0 0 0 8 0V3.1M12 12h.01M12 12a4 4 0 0 1 4 4v5H8v-5a4 4 0 0 1 4-4Z" />
          <path d="M4 21h16" />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
          <path d="M15 5.764v15M9 3.236v15" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
        </svg>
      );
    case "message":
      return (
        <svg {...common}>
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          <path d="M12 8v4M12 15h.01" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * Верхний баннер обстановки — состояние приходит из CMS.
 *
 * `unavailable` не приходит из CMS: так страница помечает, что запрос за
 * обстановкой не удался. Без этого признака отказ бэкенда выглядел как
 * подтверждённое спокойствие — худшая из возможных ошибок для портала,
 * по которому люди судят о наличии угрозы.
 */
function AlertBanner({
  state,
  top,
  copy,
}: {
  state: "calm" | "warning" | "critical" | "unavailable";
  top?: ApiAlert;
  copy: Dictionary["home"];
}) {
  if (state === "unavailable") {
    const u = copy.unavailable;
    return (
      <section
        aria-label={u.aria}
        aria-live="polite"
        className="border-b border-[var(--color-divider)]"
        style={{ background: "var(--hz-warning-bg)" }}
      >
        <div className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center gap-2.5 px-6 py-2.5 text-[13px] max-[920px]:px-4">
          <TriangleAlert
            size={17}
            strokeWidth={1.5}
            aria-hidden="true"
            style={{ color: "var(--hz-warning)", flex: "none" }}
          />
          <span>
            <strong>{u.strong}</strong>
            {u.text}
          </span>
          <span className="flex-1" />
          <a href="tel:112" style={{ color: "var(--color-accent-700)" }}>
            {u.call112}
          </a>
        </div>
      </section>
    );
  }
  if (state === "critical") {
    const c = copy.critical;
    const href = top ? `/alerts/${top.slug}` : routes.alert;
    return (
      <section
        aria-label={copy.banner.criticalAria}
        style={{ background: "var(--hz-critical-solid)", color: "#fff" }}
      >
        <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-[14px] px-6 py-7 max-[920px]:px-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="crit-dot h-3 w-3 rounded-full"
              style={{ background: "#fff" }}
            />
            <span className="text-[11px] font-bold uppercase tracking-[.12em]">
              {top?.level_label ?? c.kicker}
            </span>
            {top?.datetime && (
              <span className="text-xs opacity-85">{top.datetime}</span>
            )}
          </div>
          {/* Не h1: у страницы уже есть единственный локализованный h1
              (название портала, sr-only). Второй h1 ломал бы структуру
              документа; визуальный приоритет предупреждения сохранён тем же
              кеглем и гарнитурой заголовка. */}
          <p
            className="m-0 text-[34px] font-semibold leading-[1.12] [font-family:var(--font-heading)]"
            style={{ color: "#fff" }}
          >
            {top?.title ?? c.title}
          </p>
          <p className="m-0 max-w-[760px] text-base leading-[1.5]">
            {top?.summary ?? c.text}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={routes.guides}
              className="btn px-5 py-2.5 text-[15px]"
              style={{
                background: "#fff",
                color: "var(--hz-critical-solid)",
                borderColor: "#fff",
              }}
            >
              {copy.banner.whatToDo}
            </Link>
            <Link
              href={href}
              className="btn px-5 py-2.5 text-[15px]"
              style={{ color: "#fff", borderColor: "rgba(255,255,255,.6)" }}
            >
              {copy.banner.detailsMap}
            </Link>
            <a
              href="tel:112"
              className="btn px-5 py-2.5 text-[15px]"
              style={{ color: "#fff", borderColor: "rgba(255,255,255,.6)" }}
            >
              {copy.banner.call112}
            </a>
          </div>
        </div>
      </section>
    );
  }
  if (state === "warning") {
    const w = copy.warning;
    const href = top ? `/alerts/${top.slug}` : routes.alert;
    return (
      <section
        aria-label={copy.banner.warningAria}
        className="border-b border-[var(--color-divider)]"
        style={{ background: "var(--hz-warning-bg)" }}
      >
        <div className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center gap-[14px] px-6 py-[14px] max-[920px]:px-4">
          <TriangleAlert
            size={20}
            strokeWidth={1.5}
            aria-hidden="true"
            style={{ color: "var(--hz-warning)", flex: "none" }}
          />
          <span
            className="tag font-bold uppercase tracking-[.08em]"
            style={{
              background: "var(--hz-warning)",
              color: "var(--color-bg)",
            }}
          >
            {top?.level_label ?? w.levelLabel}
          </span>
          <span className="min-w-[260px] flex-1 text-sm">
            <strong>{top?.title ?? w.strong}</strong>
            {top ? "" : w.text}
          </span>
          {(top?.datetime ?? w.time) && (
            <span className="text-xs" style={{ color: muted(55) }}>
              {top?.datetime ?? w.time}
            </span>
          )}
          <Link href={href} className="btn btn-secondary text-[13px]">
            {w.more}
          </Link>
        </div>
      </section>
    );
  }
  const c = copy.calm;
  return (
    <section
      aria-label={copy.banner.calmAria}
      className="status-calm border-b border-[var(--color-divider)]"
    >
      {/* Только статус: сводка по регионам и ссылка на карту — в блоке
          «Оперативная сводка» ниже. Раньше обе полосы дублировали друг друга
          и словами, и ссылкой. */}
      <div className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center gap-2.5 px-6 py-2.5 text-sm max-[920px]:px-4">
        <span
          className="h-[9px] w-[9px] rounded-full"
          style={{ background: "var(--hz-success)" }}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <strong>{c.strong}</strong>
          {c.text}
        </span>
      </div>
    </section>
  );
}

const tagBackground: Record<AlertLevel, string> = {
  none: "var(--color-neutral-200)",
  info: "var(--hz-info-bg)",
  warning: "var(--hz-warning-bg)",
  danger: "var(--hz-danger-bg)",
  critical: "var(--hz-critical-bg)",
};

// Цвет тега статуса проекта по локале-независимому status_tone из CMS
// (а не хардкод-зелёный для всех статусов).
const projectTagTone: Record<string, { background: string; color: string }> = {
  success: { background: "var(--hz-success-bg)", color: "var(--hz-success)" },
  info: { background: "var(--hz-info-bg)", color: "var(--hz-info)" },
  neutral: {
    background: "var(--color-neutral-100)",
    color: "var(--color-neutral-800)",
  },
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = toLocale((await params).locale);
  const { common, home, pages } = getDictionary(locale);
  // `null` — CMS не ответила. Пустую главную подставляем сами, но помним об
  // этом: ни один блок не вправе выдать отсутствие данных за факт.
  const payload = await fetchHome(locale);
  const unavailable = payload === null;
  const data = payload ?? EMPTY_HOME;
  const isOn = (type: string) => data.blocks.some((b) => b.type === type);
  const top = data.alerts.items[0];

  const regions: RegionStatus[] = data.alerts.regions.map((r) => ({
    key: r.key as RegionStatus["key"],
    name: r.name,
    level: r.level,
    count: r.count,
    statusText: r.statusText,
  }));
  // Охват для «Оперативной сводки»: считаем по данным CMS, а не по общему
  // числу регионов страны — иначе цифра была бы нашей выдумкой.
  const affectedRegions = regions.filter((r) => r.level !== "none").length;

  const slides = data.news.slice(0, 4).map((item) => ({
    kicker: [item.category, item.date].filter(Boolean).join(" · "),
    title: item.title,
    excerpt: item.excerpt ?? "",
    photoLabel: home.news.featured.photoLabel,
    href: routes.article(item.slug),
    imageSrc: cmsImageSource(item.image_data),
  }));

  // Первая инструкция — крупной плиткой, следующие две — малыми. Порядок
  // задаёт CMS (приоритетные идут первыми, см. Instruction::scopeOrdered).
  const [leadInstruction, ...restInstructions] = data.instructions;
  const sideInstructions = restInstructions.slice(0, 2);

  const featured = data.news[0];
  const featuredHasImage = cmsImageSource(featured?.image_data) !== null;
  const newsList = data.news.slice(1, 5);
  const p = home.president;

  return (
    <PageShell
      topSlot={
        <AlertBanner
          state={unavailable ? "unavailable" : data.alerts.state}
          top={top}
          copy={home}
        />
      }
    >
      {/* У главной нет отдельного визуального титула: первый экран занят
          обязательными слайдером и карточкой Президента. Оставляем одно
          локализованное h1 для структуры документа, объявления маршрута
          скринридером и навигации по заголовкам, не добавляя маркетинговый
          заголовок поверх правительственного интерфейса. */}
      <h1 className="sr-only">{common.siteName}</h1>

      {/* Главное: слайдер + карточка Президента.
          Слайдер строится только из материалов CMS. Раньше при нехватке
          новостей подставлялись три демонстрационных слайда из словаря — с
          выдуманными заголовками, датами и ссылками на несуществующие
          материалы. Нет новостей — нет и слайдера: карточка Президента
          занимает всю ширину. */}
      <section
        aria-label={pages.home.main}
        className={
          slides.length > 0
            ? "grid grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] items-stretch gap-7 max-[920px]:grid-cols-1"
            : "grid grid-cols-1 items-stretch gap-7"
        }
      >
        {slides.length > 0 && (
          <NewsSlider slides={slides} readMore={home.slider.readMore} />
        )}
        <a
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={p.aria}
          className="blueprint mast-card surface-hover flex min-w-0 flex-col"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <span className="block min-h-[240px] flex-1">
            {/* Без preload: единственная приоритетная предзагрузка на первом
                экране — фото первого слайда (см. NewsSlider). Фото президента
                на широком экране выше вьюпорта не конкурирует — оно и так
                загрузится сразу (в кадре), а на мобильном находится под
                слайдером и не должно отнимать канал у LCP. Геометрия
                зарезервирована, так что lazy не даёт скачка. */}
            <ImageSlot
              src={p.photo}
              alt={pages.home.presidentPhotoAlt}
              sizes="(max-width: 920px) calc(100vw - 32px), 360px"
            />
          </span>
          <span className="flex flex-col gap-1 px-4 pb-4 pt-[14px]">
            <span
              className="text-[13px] tracking-[.04em]"
              style={{ color: "var(--color-accent-700)" }}
            >
              {p.kicker}
            </span>
            <span className="text-[19px] font-semibold leading-[1.15] [font-family:var(--font-heading)]">
              {p.name}
            </span>
            <span className="text-sm" style={{ color: muted(75) }}>
              {p.role}
            </span>
            <span
              className="mt-2 border-t border-[var(--color-divider)] pt-2 text-sm leading-[1.5]"
              style={{ color: muted(78) }}
            >
              {p.quote}
            </span>
          </span>
        </a>
      </section>

      {/* Оперативная сводка */}
      <section
        aria-label={home.ops.title}
        className="blueprint command-strip mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 max-[560px]:flex-col max-[560px]:items-start"
      >
        <h2 className="kicker-heading m-0" style={{ color: muted(72) }}>
          {home.ops.title}
        </h2>
        {/* Четыре различимых состояния, и ни одно не выдаёт молчание бэкенда
            за факт: недоступность данных, устаревание открытой вкладки,
            действующие предупреждения и подтверждённое их отсутствие. Голый
            «0» рядом со строкой «предупреждений нет» читался как противоречие,
            поэтому число показывается только когда несёт смысл; охват по
            регионам берётся из alerts.regions ответа CMS. */}
        {unavailable ? (
          <span
            className="inline-flex items-center gap-2 text-sm"
            style={{ color: muted(80) }}
          >
            <TriangleAlert
              size={15}
              strokeWidth={1.5}
              aria-hidden="true"
              style={{ color: "var(--hz-warning)", flex: "none" }}
            />
            {home.ops.unavailableText}
          </span>
        ) : data.alerts.count > 0 ? (
          <span className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="inline-flex items-baseline gap-2">
              <span className="text-sm" style={{ color: muted(75) }}>
                {home.ops.activeLabel}
              </span>
              <span
                className="text-2xl font-semibold [font-family:var(--font-heading)]"
                style={{ color: "var(--hz-danger)" }}
              >
                {data.alerts.count}
              </span>
            </span>
            {affectedRegions > 0 && (
              <span
                className="text-sm [font-variant-numeric:tabular-nums]"
                style={{ color: muted(70) }}
              >
                {home.ops.affectedRegions}: {affectedRegions}
              </span>
            )}
          </span>
        ) : (
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
            <span style={{ color: muted(80) }}>{home.ops.noneText}</span>
            {regions.length > 0 && (
              <span
                className="[font-variant-numeric:tabular-nums]"
                style={{ color: muted(70) }}
              >
                {home.ops.watchedRegions}: {regions.length}
              </span>
            )}
          </span>
        )}
        <span className="flex-1" />
        {/* Открытая вкладка не получает ISR-обновления сама. При возвращении
            на неё компонент тихо перезапрашивает маршрут и на это время
            показывает здесь пометку «данные могли устареть» — четвёртое
            состояние обстановки. Без JS пометки просто нет. */}
        <RefreshOnVisible staleLabel={home.ops.staleText} />
        <Link
          href={routes.map}
          className="section-link shrink-0 text-[13px]"
          style={{ color: "var(--color-accent-700)" }}
        >
          {home.ops.mapLink}
        </Link>
      </section>

      {/* Быстрые действия */}
      <section aria-label={pages.home.quickActions} className="mt-[52px]">
        <SectionHeader
          as="h2"
          title={home.quickActions.title}
          link={{ label: home.quickActions.allLink, href: routes.guides }}
        />
        <div className="grid grid-cols-4 grid-rows-[auto_auto] gap-[14px] max-[920px]:grid-cols-2 max-[560px]:grid-cols-1">
          {/* Инструкции приходят из CMS: и состав, и адреса. Раньше все шесть
              плиток были зашиты в словарь со слагами earthquake/flood/first-aid,
              которых в CMS нет — реальные слаги это транслит русских названий,
              так что каждая плитка вела в 404. Три навигационные плитки ниже
              ведут в разделы сайта, а не к материалам, и остаются статичными. */}
          {leadInstruction && (
            <Link
              href={routes.guide(leadInstruction.slug)}
              className="blueprint accent-900-hover row-span-2 flex flex-col gap-2.5 p-5 max-[560px]:row-span-1"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <HazardIcon name={leadInstruction.hazard_icon} size={30} tone="#d6ebff" />
              <span className="text-[22px] font-semibold leading-[1.15] text-white [font-family:var(--font-heading)]">
                {leadInstruction.title}
              </span>
              <span className="text-[13px] leading-[1.5] text-white/75">
                {leadInstruction.summary}
              </span>
              <span className="mt-auto text-[13px]" style={{ color: "#d6ebff" }}>
                {home.quickActions.openInstruction}
              </span>
            </Link>
          )}
          {sideInstructions.map((item) => (
            <Link
              key={item.slug}
              href={routes.guide(item.slug)}
              className="blueprint surface-hover flex items-start gap-3 p-4"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <span className="quick-ico">
                <HazardIcon name={item.hazard_icon} />
              </span>
              <span>
                <span className="block text-[17px] font-semibold [font-family:var(--font-heading)]">
                  {item.title}
                </span>
                <span className="text-[12.5px]" style={{ color: muted(62) }}>
                  {item.summary}
                </span>
              </span>
            </Link>
          ))}
          {home.quickActions.links.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="blueprint surface-hover flex items-start gap-3 p-4"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <span className="quick-ico">
                <QuickIcon name={s.icon} />
              </span>
              <span>
                <span className="block text-[17px] font-semibold [font-family:var(--font-heading)]">
                  {s.title}
                </span>
                <span className="text-[12.5px]" style={{ color: muted(62) }}>
                  {s.desc}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Обстановка по регионам */}
      {isOn("regions_map") && (
        <section aria-label={pages.home.alertsMap} className="mt-[52px]">
          <SectionHeader
            as="h2"
            title={home.regionSection.title}
          />
          <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)] items-start gap-7 max-[920px]:grid-cols-1">
            <div className="blueprint p-3">
              {/* lazy: на главной карта ниже первого экрана — код d3-geo и
                  вычисление геометрии не нужны до прокрутки (см. TjRiskMap).
                  Геометрия блока зарезервирована обёрткой, SSR-список регионов
                  рядом остаётся доступен и без графики. */}
              <TjRiskMap regions={regions} height={440} lazy />
              {/* role="group": aria-label на безролевом <div> вспомогательные
                  технологии игнорируют, и легенда оставалась без имени.
                  13px вместо 12: легенда расшифровывает статусы. */}
              <div
                role="group"
                className="mt-2.5 flex flex-wrap gap-4 border-t border-[var(--color-divider)] px-2 pb-1 pt-2.5 text-[13px]"
                aria-label={pages.home.mapLegend}
              >
                {legendItems(locale).map((l) => (
                  <span
                    key={l.level}
                    className="inline-flex items-center gap-1.5"
                  >
                    <span
                      className="h-3 w-3 border border-[var(--color-divider)]"
                      style={{ background: levelMapFill[l.level] }}
                    />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col">
              <div role="list" aria-label={pages.home.regionsList}>
                {regions.map((r) => (
                  <div
                    key={r.key}
                    role="listitem"
                    className="flex items-center gap-2.5 border-b border-[var(--color-divider)] px-0.5 py-3"
                  >
                    <span
                      className="h-[9px] w-[9px] flex-none rounded-full"
                      style={{ background: levelDotColor[r.level] }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold [font-family:var(--font-heading)]">
                        {r.name}
                      </span>
                      {/* Состояние региона — значимый статус, а не подпись:
                          13px вместо 12. */}
                      <span className="text-[13px]" style={{ color: muted(58) }}>
                        {r.statusText}
                      </span>
                    </span>
                    <span className="tag tag-neutral flex-none">
                      {levelBadges(locale)[r.level]}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href={routes.map}
                className="btn btn-secondary mt-[14px] self-start"
              >
                {home.regionSection.openFull}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Предупреждения */}
      {isOn("active_alerts") && data.alerts.items.length > 0 && (
        <section aria-label={pages.home.latestAlerts} className="mt-[52px]">
          <SectionHeader
            as="h2"
            title={home.warnings.title}
            link={{ label: home.warnings.allLink, href: routes.alert }}
          />
          <div className="grid grid-cols-3 gap-[14px] max-[920px]:grid-cols-1">
            {data.alerts.items.map((a) => {
              const color = levelDotColor[a.level as AlertLevel];
              return (
                <Link
                  key={a.slug}
                  href={`/alerts/${a.slug}`}
                  className="blueprint surface-hover-6 flex flex-col gap-2 p-[18px]"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    borderTop: `3px solid ${color}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="tag font-bold uppercase tracking-[.06em]"
                      style={{
                        background: tagBackground[a.level as AlertLevel],
                        color,
                      }}
                    >
                      {a.hazard_label}
                    </span>
                    <span
                      className="text-[11.5px]"
                      style={{ color: muted(50) }}
                    >
                      {a.status}
                    </span>
                  </div>
                  <span className="text-[19px] font-semibold leading-[1.2] [font-family:var(--font-heading)]">
                    {a.title}
                  </span>
                  <span className="text-[12.5px]" style={{ color: muted(62) }}>
                    {a.region}
                    {a.datetime ? ` · ${a.datetime}` : ""}
                  </span>
                  <span
                    className="text-[13px] leading-[1.5]"
                    style={{ color: muted(72) }}
                  >
                    {a.summary}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Новости */}
      {isOn("latest_news") && featured && (
        <section aria-label={pages.home.news} className="mt-[52px]">
          <SectionHeader
            as="h2"
            title={home.news.title}
            link={{ label: home.news.allLink, href: routes.news }}
          />
          <div className="grid grid-cols-2 gap-7 max-[920px]:grid-cols-1">
            <Link
              href={`/news/${featured.slug}`}
              className={
                featuredHasImage
                  ? "flex flex-col gap-3"
                  : "home-featured-card blueprint surface-hover flex flex-col gap-3 p-5"
              }
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {featuredHasImage && featured.image_data ? (
                <span className="blueprint duotone relative block h-[220px]">
                  <CmsImage
                    image={featured.image_data}
                    sizes="(max-width: 920px) 100vw, 620px"
                  />
                </span>
              ) : null}
              <span
                className="text-[11px] uppercase tracking-[.1em]"
                style={{ color: "var(--color-accent-700)" }}
              >
                {[featured.category, featured.date].filter(Boolean).join(" · ")}
              </span>
              <span
                className={`font-semibold leading-[1.2] [font-family:var(--font-heading)] ${
                  featuredHasImage ? "text-[21px]" : "text-[26px]"
                }`}
              >
                {featured.title}
              </span>
              {featured.excerpt ? (
                <span
                  className="text-[14px] leading-[1.55]"
                  style={{ color: muted(70) }}
                >
                  {featured.excerpt}
                </span>
              ) : null}
              {!featuredHasImage ? (
                <span
                  className="mt-auto pt-2 text-[13px]"
                  style={{ color: "var(--color-accent-700)" }}
                >
                  {home.slider.readMore}
                </span>
              ) : null}
            </Link>
            <div className="flex flex-col">
              {newsList.map((it, i) => (
                <Link
                  key={it.slug}
                  href={`/news/${it.slug}`}
                  className="row-link border-b border-[var(--color-divider)]"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    padding: i === 0 ? "0 0 14px" : "14px 0",
                    borderBottom:
                      i === newsList.length - 1 ? "none" : undefined,
                  }}
                >
                  <span
                    className="text-[11px] uppercase tracking-[.08em]"
                    style={{ color: muted(50) }}
                  >
                    {[it.category, it.date].filter(Boolean).join(" · ")}
                  </span>
                  <span className="mt-1 block text-[17px] font-semibold leading-[1.25] [font-family:var(--font-heading)]">
                    {it.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ключевые показатели. Раньше это были константы словаря — «247
          спасательных операций», «86 500 обучено» — которые не менялись ни при
          каких данных и выдавали статистику ведомства за актуальную. Теперь
          цифры вводит редактор в настройках блока: считать их система не может,
          таких данных в CMS нет. Нет записей — нет и блока. */}
      {isOn("indicators") && (data.indicators ?? []).length > 0 && (
        <section aria-label={pages.home.kpis} className="mt-[52px]">
          <div className="blueprint grid grid-cols-4 py-2 max-[920px]:grid-cols-2 max-[560px]:grid-cols-1">
            {(data.indicators ?? []).map((item, i) => (
              <div
                key={item.label}
                className="px-[22px] py-[22px]"
                style={{
                  borderRight:
                    i === (data.indicators ?? []).length - 1
                      ? undefined
                      : "1px solid var(--color-divider)",
                }}
              >
                <div
                  className="text-[34px] font-semibold [font-family:var(--font-heading)]"
                  style={{ color: "var(--color-accent-800)" }}
                >
                  {item.value}
                </div>
                <div
                  className="text-[12.5px] leading-[1.4]"
                  style={{ color: muted(62) }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Официальная информация: документы + объявления / проекты */}
      <section
        aria-label={pages.home.officialInfo}
        className="mt-[52px] grid grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] gap-7 max-[920px]:grid-cols-1"
      >
        <div>
          {isOn("documents") && data.documents.length > 0 && (
            <>
              <SectionHeader
                as="h2"
                title={home.documents.title}
                link={{ label: home.documents.allLink, href: routes.documents }}
              />
              {data.documents.map((d) => (
                <Link
                  key={d.id}
                  href={d.href ?? routes.documents}
                  // flex-wrap + min-w-0: при увеличении текста до 200% на 360px
                  // правый столбец (размер файла / срок) не помещался в строку и
                  // вылезал за край экрана. С переносом строка становится в две.
                  className="row-link flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[var(--color-divider)] px-0.5 py-3"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span className="tag tag-neutral flex-none">{d.type}</span>
                  <span className="min-w-0 flex-1 text-sm">{d.title}</span>
                  <span
                    className="flex-none text-[13px]"
                    style={{ color: muted(50) }}
                  >
                    {d.size ?? ""}
                  </span>
                </Link>
              ))}
            </>
          )}

          {isOn("announcements") && data.announcements.length > 0 && (
            <>
              <SectionHeader
                id="announcements"
                as="h2"
                title={home.announcements.title}
                link={{
                  label: home.announcements.allLink,
                  href: routes.announcements,
                }}
              />
              {data.announcements.map((a) => (
                <Link
                  key={a.slug}
                  // Каждое объявление ведёт на свою страницу: раньше все строки
                  // вели в общий список, и найти нужное приходилось заново.
                  href={routes.announcement(a.slug)}
                  // flex-wrap + min-w-0: при увеличении текста до 200% на 360px
                  // правый столбец (размер файла / срок) не помещался в строку и
                  // вылезал за край экрана. С переносом строка становится в две.
                  className="row-link flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[var(--color-divider)] px-0.5 py-3"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span
                    className={`tag ${a.kind === "vacancy" ? "tag-accent" : "tag-outline"} flex-none`}
                  >
                    {a.kind_label}
                  </span>
                  <span className="flex-1 text-sm">{a.title}</span>
                  <span
                    className="flex-none text-[13px]"
                    style={{ color: muted(50) }}
                  >
                    {a.deadline}
                  </span>
                </Link>
              ))}
            </>
          )}
        </div>

        {isOn("projects") && data.projects.length > 0 && (
          <div className="min-w-0 self-start">
            <SectionHeader
              as="h2"
              title={home.projects.title}
              link={{ label: home.projects.allLink, href: routes.projects }}
            />
            {data.projects.map((pr) => (
              <Link
                key={pr.slug}
                href={`/projects/${pr.slug}`}
                className="blueprint surface-hover mt-[14px] flex flex-col gap-1.5 p-4"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="tag text-[10px] font-semibold"
                    style={
                      projectTagTone[pr.status_tone] ?? projectTagTone.neutral
                    }
                  >
                    {pr.status}
                  </span>
                  <span className="text-[11.5px]" style={{ color: muted(52) }}>
                    {pr.years}
                  </span>
                </span>
                <span className="text-[16.5px] font-semibold leading-[1.25] [font-family:var(--font-heading)]">
                  {pr.title}
                </span>
                <span className="text-xs" style={{ color: muted(58) }}>
                  {[pr.partner, pr.budget].filter(Boolean).join(" · ")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
