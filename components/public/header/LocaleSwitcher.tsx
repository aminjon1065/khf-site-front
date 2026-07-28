"use client";

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
  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale !== locale) {
      window.location.assign(
        withLocale(nextLocale, stripLocale(window.location.pathname)),
      );
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
