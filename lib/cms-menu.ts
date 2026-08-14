import type { ApiMenuItem } from "@/lib/api";

export interface PublicNavChild {
  label: string;
  href: string;
}

export interface PublicNavItem {
  label: string;
  href: string;
  children: PublicNavChild[];
}

function resolveLabel(
  url: string,
  rawLabel: string,
  labelByUrl: Record<string, string>,
): string {
  const fromDictionary = url ? labelByUrl[url] : undefined;
  return (fromDictionary ?? rawLabel).trim();
}

/**
 * CMS-меню → пункты шапки. Родитель без URL не отбрасывается, если у него
 * есть подпункты: на сайте он становится заголовком выпадающего меню.
 */
export function cmsMenuToNavItems(
  items: ApiMenuItem[] | undefined,
  labelByUrl: Record<string, string>,
): PublicNavItem[] {
  return (items ?? [])
    .map((item): PublicNavItem | null => {
      const href = (item.url ?? "").trim();
      const label = resolveLabel(href, item.label, labelByUrl);
      if (!label) {
        return null;
      }

      const children = (item.children ?? [])
        .map((child): PublicNavChild | null => {
          const childHref = (child.url ?? "").trim();
          const childLabel = resolveLabel(childHref, child.label, labelByUrl);

          return childHref && childLabel
            ? { label: childLabel, href: childHref }
            : null;
        })
        .filter((child): child is PublicNavChild => child !== null);

      if (!href && children.length === 0) {
        return null;
      }

      return { label, href, children };
    })
    .filter((item): item is PublicNavItem => item !== null);
}

/**
 * Подвал — плоский список ссылок: родитель (если есть URL) и его дети.
 */
export function flattenFooterMenu(
  items: ApiMenuItem[] | undefined,
  labelByUrl: Record<string, string>,
): PublicNavChild[] {
  return (items ?? []).flatMap((item) => {
    const rows: PublicNavChild[] = [];
    const href = (item.url ?? "").trim();
    const label = resolveLabel(href, item.label, labelByUrl);

    if (href && href !== "#" && label) {
      rows.push({ label, href });
    }

    for (const child of item.children ?? []) {
      const childHref = (child.url ?? "").trim();
      const childLabel = resolveLabel(childHref, child.label, labelByUrl);

      if (childHref && childHref !== "#" && childLabel) {
        rows.push({ label: childLabel, href: childHref });
      }
    }

    return rows;
  });
}
