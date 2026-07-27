import type { ApiNewsItem, ApiSettings } from "@/lib/api";
import type { Locale } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/seo";

// E-3: structured data (schema.org JSON-LD), scoped exactly per PROJECT_PLAN.md
// E-3 — GovernmentOrganization (global), NewsArticle (news detail),
// BreadcrumbList (every page that already shows visual breadcrumbs). Server
// components only (no "use client"): this is static markup derived from data
// each page already fetches, nothing interactive.

function absoluteUrl(locale: Locale, href: string): string {
  return href === "/" ? `${siteUrl()}/${locale}` : `${siteUrl()}/${locale}${href}`;
}

/** Renders a <script type="application/ld+json"> from an already-built object. */
function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify of API-sourced strings can never close the tag early
      // the way raw user HTML could, but escape "<" defensively anyway since
      // this is CMS-editable content (org.about, article titles, ...).
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * Sitewide GovernmentOrganization — rendered once in PageShell, which already
 * fetches `settings` for the header/footer, so this adds zero extra requests.
 * Silently renders nothing if settings failed to load (same graceful-
 * degradation posture as the rest of the site — a missing JSON-LD block is
 * not worth surfacing an error for).
 */
export function OrganizationJsonLd({
  settings,
  locale,
}: {
  settings: ApiSettings | null;
  locale: Locale;
}) {
  if (!settings) {
    return null;
  }

  const sameAs = Object.values(settings.social ?? {}).filter(Boolean);

  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "GovernmentOrganization",
        name: settings.org.name,
        alternateName: settings.org.short_name,
        description: settings.org.about,
        url: absoluteUrl(locale, "/"),
        logo: `${siteUrl()}/assets/logo-kchs-${locale}.webp`,
        ...(settings.org.address
          ? {
              address: {
                "@type": "PostalAddress",
                streetAddress: settings.org.address,
                addressCountry: "TJ",
              },
            }
          : {}),
        ...(settings.org.email ? { email: settings.org.email } : {}),
        ...(settings.org.emergency_number
          ? { telephone: settings.org.emergency_number }
          : {}),
        ...(sameAs.length > 0 ? { sameAs } : {}),
      }}
    />
  );
}

/**
 * NewsArticle for a single article detail page. `dateModified` is
 * deliberately omitted — ApiNewsItem has no such field (the CMS only tracks
 * `datetime`, the publish time), fabricating one would be worse than leaving
 * it out.
 */
export function NewsArticleJsonLd({
  item,
  locale,
  path,
}: {
  item: ApiNewsItem;
  locale: Locale;
  path: string;
}) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: item.title,
        description: item.excerpt,
        mainEntityOfPage: absoluteUrl(locale, path),
        ...(item.image ? { image: [item.image] } : {}),
        ...(item.datetime ? { datePublished: item.datetime } : {}),
      }}
    />
  );
}

/**
 * BreadcrumbList mirroring whatever the visual `Breadcrumbs` component on
 * the same page renders — same `items` array, so the two can never drift
 * out of sync. The last item (current page) omits `item` (its URL), matching
 * both schema.org guidance and how `Breadcrumbs` itself renders it (no link).
 */
export function BreadcrumbJsonLd({
  items,
  locale,
}: {
  items: { label: string; href?: string }[];
  locale: Locale;
}) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.label,
          ...(it.href ? { item: absoluteUrl(locale, it.href) } : {}),
        })),
      }}
    />
  );
}
