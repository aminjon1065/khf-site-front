import PageShell from "@/components/public/PageShell";
import AlertBanner from "@/components/public/home/AlertBanner";
import LeadSection from "@/components/public/home/LeadSection";
import OpsSummary from "@/components/public/home/OpsSummary";
import QuickActions from "@/components/public/home/QuickActions";
import RegionsSection from "@/components/public/home/RegionsSection";
import AlertsSection from "@/components/public/home/AlertsSection";
import NewsSection from "@/components/public/home/NewsSection";
import IndicatorsSection from "@/components/public/home/IndicatorsSection";
import OfficialInfoSection from "@/components/public/home/OfficialInfoSection";
import { EMPTY_HOME, fetchHome } from "@/lib/api";
import {
  hasHomeBlock,
  homeBlockTitle,
  homeSections,
  UNAVAILABLE_HOME_SECTIONS,
  type HomeBlockType,
  type HomeSection,
} from "@/lib/home-blocks";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { RegionStatus } from "@/lib/types";

export const revalidate = 60;

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
  const top = data.alerts.items[0];

  // Блоки «Главной страницы» из CMS: только включённые, в порядке редактора.
  // Без ответа CMS — прежняя раскладка резервного режима (lib/home-blocks.ts).
  const blocks = Array.isArray(data.blocks) ? data.blocks : [];
  const sections = unavailable
    ? UNAVAILABLE_HOME_SECTIONS
    : homeSections(blocks);
  const isOn = (type: HomeBlockType) => hasHomeBlock(blocks, type);
  const titleOf = (type: HomeBlockType, fallback: string) =>
    homeBlockTitle(blocks, type) ?? fallback;

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
  const indicators = data.indicators ?? [];

  const showDocuments = isOn("documents") && data.documents.length > 0;
  const showAnnouncements =
    isOn("announcements") && data.announcements.length > 0;
  const showProjects = isOn("projects") && data.projects.length > 0;

  function renderSection(section: HomeSection) {
    switch (section) {
      case "regions":
        return (
          <RegionsSection
            key={section}
            regions={regions}
            locale={locale}
            title={titleOf("regions_map", home.regionSection.title)}
            home={home}
            ariaLabel={pages.home.alertsMap}
            legendLabel={pages.home.mapLegend}
            listLabel={pages.home.regionsList}
          />
        );
      case "alerts":
        return data.alerts.items.length > 0 ? (
          <AlertsSection
            key={section}
            items={data.alerts.items}
            title={titleOf("active_alerts", home.warnings.title)}
            home={home}
            ariaLabel={pages.home.latestAlerts}
          />
        ) : null;
      case "news":
        return data.news.length > 0 ? (
          <NewsSection
            key={section}
            news={data.news}
            title={titleOf("latest_news", home.news.title)}
            home={home}
            ariaLabel={pages.home.news}
          />
        ) : null;
      case "indicators":
        // Видимого заголовка у показателей нет: заголовок блока становится
        // доступным именем секции.
        return indicators.length > 0 ? (
          <IndicatorsSection
            key={section}
            indicators={indicators}
            ariaLabel={titleOf("indicators", pages.home.kpis)}
          />
        ) : null;
      case "quickActions":
        // Навигационные плитки (карта, телефоны, приёмная) есть и без
        // инструкций, поэтому секция зависит только от переключателя блока.
        return (
          <QuickActions
            key={section}
            instructions={data.instructions}
            title={titleOf("instructions", home.quickActions.title)}
            home={home}
            ariaLabel={pages.home.quickActions}
          />
        );
      case "officialInfo":
        return showDocuments || showAnnouncements || showProjects ? (
          <OfficialInfoSection
            key={section}
            documents={data.documents}
            announcements={data.announcements}
            projects={data.projects}
            showDocuments={showDocuments}
            showAnnouncements={showAnnouncements}
            showProjects={showProjects}
            titles={{
              documents: titleOf("documents", home.documents.title),
              announcements: titleOf("announcements", home.announcements.title),
              projects: titleOf("projects", home.projects.title),
            }}
            home={home}
            ariaLabel={pages.home.officialInfo}
          />
        ) : null;
    }
  }

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

      {/* Верх страницы от блоков CMS не зависит и всегда идёт первым. */}
      <LeadSection
        news={data.news}
        home={home}
        ariaLabel={pages.home.main}
        presidentPhotoAlt={pages.home.presidentPhotoAlt}
      />

      <OpsSummary
        unavailable={unavailable}
        alertsCount={data.alerts.count}
        affectedRegions={affectedRegions}
        watchedRegions={regions.length}
        home={home}
      />

      {sections.map(renderSection)}
    </PageShell>
  );
}
