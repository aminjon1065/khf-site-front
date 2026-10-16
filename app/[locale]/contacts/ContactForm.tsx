"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { muted } from "@/components/public/ui";
import { toApiLocale, type Locale } from "@/lib/i18n/config";
import { regionNames, regionOrder } from "@/lib/levels";
import type { ReceptionContent } from "./content";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8848/api/v1";

/**
 * Форма электронной приёмной: отправляет обращение в CMS (POST /submissions),
 * показывает реальный номер для отслеживания. Скрытое поле-ловушка (honeypot)
 * отсекает ботов; обязательное согласие на обработку ПД.
 *
 * Для ответа нужен телефон или почта — хотя бы одно (решение владельца,
 * 2026-10-16): в регионах чаще отвечают на звонок, чем на письмо. Регион —
 * код из пяти постоянных; по нему обращение находит региональное управление.
 */
export default function ContactForm({
  reception,
  locale,
}: {
  reception: ReceptionContent;
  locale: Locale;
}) {
  const { form, success } = reception;
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  // Пофайловые сообщения валидации от CMS: { email: "Некорректный адрес…" }.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [tracking, setTracking] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const successRef = useRef<HTMLDivElement | null>(null);

  // Порядок полей формы: по нему ищется ПЕРВАЯ ошибочная — курсор должен
  // уходить к верхней проблеме, а не к той, что пришла первой в JSON CMS.
  const FIELD_ORDER = [
    "name",
    "phone",
    "email",
    "region",
    "topic",
    "message",
  ] as const;
  const INPUT_ID: Record<string, string> = {
    name: "f-name",
    phone: "f-phone",
    email: "f-email",
    region: "f-region",
    topic: "f-topic",
    message: "f-text",
  };

  /**
   * Фокус на первой ошибке после ответа 422.
   *
   * Без этого человек, отправивший форму с клавиатуры или через скринридер,
   * оставался на кнопке «Отправить»: сообщения CMS появлялись выше по форме
   * и он о них не узнавал. role="alert" у сообщения объявит текст, а фокус
   * приводит курсор туда, где нужно исправлять.
   */
  useEffect(() => {
    const keys = Object.keys(fieldErrors);
    if (keys.length === 0) {
      return;
    }
    const first = FIELD_ORDER.find((f) => keys.includes(f)) ?? keys[0];
    const el = formRef.current?.querySelector<HTMLElement>(
      `#${INPUT_ID[first] ?? ""}`,
    );
    el?.focus();
    // FIELD_ORDER/INPUT_ID — константы модуля по смыслу; эффект зависит
    // только от нового набора ошибок.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldErrors]);

  /**
   * Успешная отправка заменяет форму карточкой с номером обращения. Фокус при
   * этом оставался на удалённой кнопке, то есть уезжал в <body>, и результат
   * не объявлялся. role="status" объявляет текст, tabIndex={-1} + focus()
   * переводит курсор к номеру обращения — его как раз нужно записать.
   */
  useEffect(() => {
    if (tracking) {
      successRef.current?.focus();
    }
  }, [tracking]);

  if (tracking) {
    return (
      <div
        ref={successRef}
        role="status"
        tabIndex={-1}
        className="p-[14px] text-[13.5px] leading-[1.5]"
        style={{
          background: "var(--hz-success-bg)",
          color: "var(--hz-success)",
        }}
      >
        <strong>{success.strong}</strong> {success.trackingLabel}{" "}
        <strong>{tracking}</strong>. {success.note}
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    if (!consent) {
      setError(true);
      return;
    }

    const fd = new FormData(e.currentTarget);
    const phone = String(fd.get("phone") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();

    // То же правило, что у CMS, — без лишнего запроса.
    if (phone === "" && email === "") {
      setFieldErrors({ phone: form.contact.error });
      return;
    }

    const payload = {
      name: String(fd.get("name") ?? ""),
      phone,
      email,
      region: String(fd.get("region") ?? ""),
      topic: String(fd.get("topic") ?? ""),
      message: String(fd.get("text") ?? ""),
      consent: true,
      website: String(fd.get("website") ?? ""), // honeypot
    };

    setBusy(true);
    try {
      const res = await fetch(`${API}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Язык валидационных сообщений CMS (422) определяется по этому
          // заголовку (ResolveApiLocale), иначе он зависит от настроек
          // браузера, а не от выбранного языка портала. tj → tg (API-код).
          "Accept-Language": toApiLocale(locale),
        },
        body: JSON.stringify(payload),
        // Обрыв связи не должен превращаться в вечный «Отправка…»; повтор
        // выполняет только сам пользователь (защита от дублей обращений).
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        // Раньше любой не-2xx превращался в `new Error("API " + status)`, а
        // человеку показывалось общее «попробуйте позже» — даже когда CMS
        // прислала точную причину («Некорректный адрес электронной почты»)
        // и её достаточно было показать рядом с полем.
        const body = (await res.json().catch(() => null)) as {
          message?: string;
          errors?: Record<string, string[]>;
        } | null;

        if (res.status === 422 && body?.errors) {
          setFieldErrors(
            Object.fromEntries(
              Object.entries(body.errors).map(([field, messages]) => [
                field,
                messages[0],
              ]),
            ),
          );
          return;
        }

        // 429 и прочие: CMS присылает готовую фразу — она полезнее общей.
        setServerError(body?.message || form.serverError);
        return;
      }
      const data = (await res.json()) as { tracking_number: string };
      setTracking(data.tracking_number);
    } catch (err) {
      console.error("submission failed:", err);
      setServerError(form.serverError);
    } finally {
      setBusy(false);
    }
  }

  const regions = regionNames(locale);

  const required = (
    <span aria-hidden="true" style={{ color: "var(--hz-critical)" }}>
      *
    </span>
  );

  /**
   * Сообщение CMS под полем: связано с ним через aria-describedby и объявлено
   * как alert — иначе скринридер молчал бы о причине отказа, а текст под полем
   * видит только зрячий пользователь. 12px → 13px: причина отказа относится к
   * значимым сообщениям, а не к мелкому пояснению.
   */
  const fieldError = (field: string) =>
    fieldErrors[field] ? (
      <span
        id={`err-${field}`}
        role="alert"
        className="mt-1 block text-[13px]"
        style={{ color: "var(--hz-critical)" }}
      >
        {fieldErrors[field]}
      </span>
    ) : null;

  return (
    <form ref={formRef} className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="f-name">
          {form.name.label} {required}
        </label>
        <input
          id="f-name"
          name="name"
          className="input"
          type="text"
          autoComplete="name"
          required
          maxLength={255}
          aria-invalid={fieldErrors.name ? true : undefined}
          aria-describedby={fieldErrors.name ? "err-name" : undefined}
        />
        {fieldError("name")}
      </div>

      <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
        <legend className="mb-1 p-0 text-[13px] font-semibold">
          {form.contact.legend} {required}
        </legend>
        <span
          id="hint-contact"
          className="-mt-1 block text-[11.5px]"
          style={{ color: muted(50) }}
        >
          {form.contact.hint}
        </span>

        <div className="field">
          <label htmlFor="f-phone">{form.phone.label}</label>
          <input
            id="f-phone"
            name="phone"
            className="input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+992 __ ___ __ __"
            maxLength={50}
            aria-invalid={fieldErrors.phone ? true : undefined}
            aria-describedby={
              fieldErrors.phone ? "err-phone hint-contact" : "hint-contact"
            }
          />
          {fieldError("phone")}
        </div>

        <div className="field">
          <label htmlFor="f-email">{form.email.label}</label>
          <input
            id="f-email"
            name="email"
            className="input"
            type="email"
            autoComplete="email"
            maxLength={255}
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={
              fieldErrors.email ? "err-email hint-contact" : "hint-contact"
            }
          />
          {fieldError("email")}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="f-region">{form.region.label}</label>
        <select
          id="f-region"
          name="region"
          className="input"
          style={{ appearance: "auto" }}
          defaultValue=""
          aria-invalid={fieldErrors.region ? true : undefined}
          aria-describedby={fieldErrors.region ? "err-region" : undefined}
        >
          <option value="">{form.region.empty}</option>
          {regionOrder.map((code) => (
            <option key={code} value={code}>
              {regions[code]}
            </option>
          ))}
        </select>
        {fieldError("region")}
      </div>

      <div className="field">
        <label htmlFor="f-topic">{form.topic.label}</label>
        <select
          id="f-topic"
          name="topic"
          className="input"
          style={{ appearance: "auto" }}
        >
          {form.topic.options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="f-text">
          {form.text.label} {required}
        </label>
        <textarea
          id="f-text"
          name="text"
          className="input"
          required
          minLength={10}
          maxLength={5000}
          aria-invalid={fieldErrors.message ? true : undefined}
          aria-describedby={fieldErrors.message ? "err-message" : undefined}
        />
        {fieldError("message")}
      </div>

      {/* honeypot — скрыто от людей, заполняется только ботами */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: 1,
          height: 1,
          opacity: 0,
        }}
      />

      <label className="radio items-start text-[12.5px] leading-[1.45]">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            setError(false);
          }}
        />
        <span className="dot mt-0.5" style={{ borderRadius: "2px" }} />
        {form.consent}
      </label>

      {error && (
        <div
          role="alert"
          className="text-[12.5px]"
          style={{ color: "var(--hz-critical)" }}
        >
          {form.consentError}
        </div>
      )}

      {serverError && (
        <div
          role="alert"
          className="text-[12.5px]"
          style={{ color: "var(--hz-critical)" }}
        >
          {serverError}
        </div>
      )}

      {/* aria-busy: пока идёт отправка, кнопка не просто disabled — состояние
          «занято» вспомогательные технологии объявляют отдельно (см. .btn
          [aria-busy] в globals.css: тот же вид, что и у прочих loading-кнопок). */}
      <button
        type="submit"
        className="btn btn-primary btn-block blueprint p-2.5"
        disabled={busy}
        aria-busy={busy || undefined}
      >
        {busy ? form.sending : form.submit}
      </button>
    </form>
  );
}
