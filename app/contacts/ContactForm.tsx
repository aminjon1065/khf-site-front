"use client";

import { useState, type FormEvent } from "react";
import { muted } from "@/components/public/ui";
import type { ReceptionContent } from "./content";

/**
 * Форма электронной приёмной: label над полем (не placeholder), обязательное
 * согласие на обработку ПД, валидация и success-состояние с номером обращения.
 * Изолированный клиентский компонент — карточка и вводная остаются на сервере.
 */
export default function ContactForm({ reception }: { reception: ReceptionContent }) {
  const { form, success } = reception;
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState(false);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div
        className="p-[14px] text-[13.5px] leading-[1.5]"
        style={{ background: "var(--hz-success-bg)", color: "var(--hz-success)" }}
      >
        <strong>{success.strong}</strong>
        {success.text}
      </div>
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent) {
      setError(true);
      return;
    }
    setSent(true);
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
        <textarea id="f-text" name="text" className="input" required />
      </div>

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

      <button type="submit" className="btn btn-primary btn-block blueprint p-2.5">
        {form.submit}
      </button>
    </form>
  );
}
