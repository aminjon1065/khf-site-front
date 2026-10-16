"use client";

import { useRef, useState, type FormEvent } from "react";
import { muted } from "@/components/public/ui";
import { htmlLang, toApiLocale, type Locale } from "@/lib/i18n/config";
import type { ReceptionContent } from "./content";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8848/api/v1";

type Stage = keyof ReceptionContent["statusCheck"]["stages"];

interface AppealStatus {
  tracking_number: string;
  status_code: Stage;
  status: string;
  received_at: string | null;
  updated_at: string | null;
}

/**
 * «Проверить статус обращения» — по номеру и коду проверки, которые
 * показываются после отправки (POST /submissions/status). По одному номеру
 * статус не открывается: номера идут подряд, и перебором можно было бы
 * смотреть чужие обращения. Ответ — этап и даты, ни имени, ни текста.
 */
export default function StatusCheck({
  content,
  locale,
}: {
  content: ReceptionContent["statusCheck"];
  locale: Locale;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AppealStatus | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const date = (iso: string | null): string =>
    iso
      ? new Intl.DateTimeFormat(htmlLang(locale), {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Asia/Dushanbe",
        }).format(new Date(iso))
      : "—";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const res = await fetch(`${API}/submissions/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Language": toApiLocale(locale),
        },
        body: JSON.stringify({
          tracking_number: String(fd.get("tracking_number") ?? ""),
          access_code: String(fd.get("access_code") ?? ""),
        }),
        signal: AbortSignal.timeout(15_000),
      });
      const body = (await res.json().catch(() => null)) as {
        data?: AppealStatus;
        message?: string;
      } | null;

      if (res.ok && body?.data) {
        setResult(body.data);
        // Результат появляется ниже формы: курсор и скринридер — к нему.
        requestAnimationFrame(() => resultRef.current?.focus());
        return;
      }

      // 404, 422, 429: CMS присылает готовую фразу на языке страницы.
      setError(body?.message || content.serverError);
    } catch {
      setError(content.serverError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      id="status"
      aria-labelledby="status-title"
      className="flex scroll-mt-28 flex-col gap-3 border-t border-[var(--color-divider)] pt-4"
    >
      <h3
        id="status-title"
        className="m-0 text-[16px] font-bold uppercase tracking-[.02em] [font-family:var(--font-heading)]"
      >
        {content.title}
      </h3>
      <p className="m-0 text-[12.5px] leading-[1.5]" style={{ color: muted(65) }}>
        {content.intro}
      </p>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="s-number">{content.numberLabel}</label>
          <input
            id="s-number"
            name="tracking_number"
            className="input"
            type="text"
            required
            maxLength={40}
            placeholder="КЧС-2026-00012"
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label htmlFor="s-code">{content.codeLabel}</label>
          <input
            id="s-code"
            name="access_code"
            className="input uppercase tracking-[.08em]"
            type="text"
            required
            maxLength={20}
            placeholder="XXXX-XXXX"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-describedby="s-code-hint"
          />
          <span
            id="s-code-hint"
            className="mt-1 block text-[11.5px]"
            style={{ color: muted(50) }}
          >
            {content.lostCode}
          </span>
        </div>

        {error && (
          <div
            role="alert"
            className="text-[12.5px]"
            style={{ color: "var(--hz-critical)" }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-secondary btn-block p-2.5"
          disabled={busy}
          aria-busy={busy || undefined}
        >
          {busy ? content.checking : content.submit}
        </button>
      </form>

      {result && (
        <div
          ref={resultRef}
          role="status"
          tabIndex={-1}
          className="blueprint flex flex-col gap-1.5 p-[14px] text-[13px] leading-[1.5]"
        >
          <span className="text-[12px]" style={{ color: muted(55) }}>
            {result.tracking_number}
          </span>
          <span>
            {content.statusLabel}: <strong>{result.status}</strong>
          </span>
          <span style={{ color: muted(70) }}>
            {content.stages[result.status_code]}
          </span>
          <span className="text-[12px]" style={{ color: muted(55) }}>
            {content.receivedLabel}: {date(result.received_at)} ·{" "}
            {content.updatedLabel}: {date(result.updated_at)}
          </span>
        </div>
      )}
    </section>
  );
}
