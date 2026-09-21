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
  const indicators = data.indicators ?? [];

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

      <QuickActions
        instructions={data.instructions}
        home={home}
        ariaLabel={pages.home.quickActions}
      />

      {isOn("regions_map") && (
        <RegionsSection
          regions={regions}
          locale={locale}
          home={home}
          ariaLabel={pages.home.alertsMap}
          legendLabel={pages.home.mapLegend}
          listLabel={pages.home.regionsList}
        />
      )}

      {isOn("active_alerts") && data.alerts.items.length > 0 && (
        <AlertsSection
          items={data.alerts.items}
          home={home}
          ariaLabel={pages.home.latestAlerts}
        />
      )}

      {isOn("latest_news") && data.news.length > 0 && (
        <NewsSection news={data.news} home={home} ariaLabel={pages.home.news} />
      )}

      {isOn("indicators") && indicators.length > 0 && (
        <IndicatorsSection
          indicators={indicators}
          ariaLabel={pages.home.kpis}
        />
      )}

      <OfficialInfoSection
        documents={data.documents}
        announcements={data.announcements}
        projects={data.projects}
        showDocuments={isOn("documents")}
        showAnnouncements={isOn("announcements")}
        showProjects={isOn("projects")}
        home={home}
        ariaLabel={pages.home.officialInfo}
      />
    </PageShell>
  );
}
