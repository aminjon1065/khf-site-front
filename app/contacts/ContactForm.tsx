"use client";

import { useState, type FormEvent } from "react";
import { muted } from "@/components/public/ui";
import type { ReceptionContent } from "./content";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8848/api/v1";

/**
 * Форма электронной приёмной: отправляет обращение в CMS (POST /submissions),
 * показывает реальный номер для отслеживания. Скрытое поле-ловушка (honeypot)
 * отсекает ботов; обязательное согласие на обработку ПД.
 */
export default function ContactForm({
  reception,
}: {
  reception: ReceptionContent;
}) {
  const { form, success } = reception;
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [tracking, setTracking] = useState<string | null>(null);

  if (tracking) {
    return (
      <div
        className="p-[14px] text-[13.5px] leading-[1.5]"
        style={{ background: "var(--hz-success-bg)", color: "var(--hz-success)" }}
      >
        <strong>{success.strong}</strong> Номер для отслеживания:{" "}
        <strong>{tracking}</strong>. Копия направлена на указанную почту.
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    if (!consent) {
      setError(true);
      return;
    }

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      topic: String(fd.get("topic") ?? ""),
      message: String(fd.get("text") ?? ""),
      consent: true,
      website: String(fd.get("website") ?? ""), // honeypot
    };

    setBusy(true);
    try {
      const res = await fetch(`${API}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`API ${res.status}`);
      }
      const data = (await res.json()) as { tracking_number: string };
      setTracking(data.tracking_number);
    } catch (err) {
      console.error("submission failed:", err);
      setServerError(
        "Не удалось отправить обращение. Попробуйте позже или позвоните 112.",
      );
    } finally {
      setBusy(false);
    }
  }

  const required = (
    <span aria-hidden="true" style={{ color: "var(--hz-critical)" }}>
      *
    </span>
  );

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="f-name">{form.name.label} {required}</label>
        <input id="f-name" name="name" className="input" type="text" autoComplete="name" required />
      </div>

      <div className="field">
        <label htmlFor="f-email">{form.email.label} {required}</label>
        <input id="f-email" name="email" className="input" type="email" autoComplete="email" required />
        <span className="mt-1 block text-[11.5px]" style={{ color: muted(50) }}>
          {form.email.hint}
        </span>
      </div>

      <div className="field">
        <label htmlFor="f-topic">{form.topic.label}</label>
        <select id="f-topic" name="topic" className="input" style={{ appearance: "auto" }}>
          {form.topic.options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="f-text">{form.text.label} {required}</label>
        <textarea id="f-text" name="text" className="input" required minLength={10} />
      </div>

      {/* honeypot — скрыто от людей, заполняется только ботами */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
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
        <div role="alert" className="text-[12.5px]" style={{ color: "var(--hz-critical)" }}>
          {form.consentError}
        </div>
      )}

      {serverError && (
        <div role="alert" className="text-[12.5px]" style={{ color: "var(--hz-critical)" }}>
          {serverError}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary btn-block blueprint p-2.5"
        disabled={busy}
      >
        {busy ? "Отправка…" : form.submit}
      </button>
    </form>
  );
}
