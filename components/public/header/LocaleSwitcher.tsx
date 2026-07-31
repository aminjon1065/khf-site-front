"use client";

import { usePathname, useRouter } from "next/navigation";
import { startNavigationProgress } from "@/lib/navigation-progress";
import {
  LOCALES,
  LOCALE_LABELS,
  stripLocale,
  withLocale,
  type Locale,
} from "@/lib/i18n/config";

export default function LocaleSwitcher({
  label,
  locale,
}: {
  label: string;
  locale: Locale;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // router.push, а не window.location.assign: смена языка — обычный переход,
  // перезагружать всё приложение ради неё не нужно. Куку NEXT_LOCALE проставит
  // proxy.ts на самом локализованном запросе.
  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale !== locale) {
      startNavigationProgress();
      router.push(withLocale(nextLocale, stripLocale(pathname)));
    }
  };

  return (
    <span className="seg" role="group" aria-label={label}>
      {LOCALES.map((candidate) => (
        <label key={candidate} className="seg-opt px-2.5 py-[3px] text-xs">
          <input
            type="radio"
            name="lang"
            checked={locale === candidate}
            onChange={() => switchLocale(candidate)}
          />
          {LOCALE_LABELS[candidate]}
        </label>
      ))}
    </span>
  );
}
