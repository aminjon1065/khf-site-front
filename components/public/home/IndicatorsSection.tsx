import { muted } from "@/components/public/ui";
import type { ApiHome } from "@/lib/api";

/**
 * Ключевые показатели. Раньше это были константы словаря — «247
 * спасательных операций», «86 500 обучено» — которые не менялись ни при
 * каких данных и выдавали статистику ведомства за актуальную. Теперь
 * цифры вводит редактор в настройках блока: считать их система не может,
 * таких данных в CMS нет. Нет записей — нет и блока.
 */
export default function IndicatorsSection({
  indicators,
  ariaLabel,
}: {
  indicators: NonNullable<ApiHome["indicators"]>;
  ariaLabel: string;
}) {
  return (
    <section aria-label={ariaLabel} className="mt-[52px]">
      <div className="blueprint grid grid-cols-4 py-2 max-[920px]:grid-cols-2 max-[560px]:grid-cols-1">
        {indicators.map((item, i) => (
          <div
            key={item.label}
            className="px-[22px] py-[22px]"
            style={{
              borderRight:
                i === indicators.length - 1
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
  );
}
