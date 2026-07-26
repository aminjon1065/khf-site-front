import { getUiStrings } from "@/lib/i18n/ui-strings";
import type { Locale } from "@/lib/i18n/config";

/**
 * B-6: инлайн-фолбэк на детальных страницах, когда сам запрос к CMS упал
 * (не 404 — сеть/5xx). Это ОЖИДАЕМАЯ ошибка (см. node_modules/next/dist/docs
 * .../error-handling.md, раздел "Handling expected errors"): страница
 * по-прежнему успешно рендерится, просто с этим содержимым вместо материала.
 *
 * Сознательно НЕ полагается на app/[locale]/error.tsx: throw из тела
 * async-страницы, конкурирующий с throw в generateMetadata той же страницы,
 * на практике даёт голый "Internal Server Error" вместо кастомной границы
 * (проверено вручную под next start с недоступным API_URL) — стриминг ещё не
 * успевает начаться, отдавать управление error.tsx уже не на что. Здесь же
 * страница просто успешно возвращает этот фрагмент вместо материала — обычный
 * успешный рендер, без исключения вообще.
 */
export default function FetchErrorFallback({ locale }: { locale: Locale }) {
  const t = getUiStrings(locale).errorPage;
  return (
    <div
      style={{
        minHeight: "40vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "var(--space-4)",
        padding: "var(--space-8) var(--space-4)",
      }}
    >
      <h1 style={{ margin: 0 }}>{t.title}</h1>
      <p className="text-muted" style={{ maxWidth: "42ch", margin: 0 }}>
        {t.text}
      </p>
    </div>
  );
}
