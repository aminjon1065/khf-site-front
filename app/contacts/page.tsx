import PageShell from "@/components/public/PageShell";
import { muted } from "@/components/public/ui";
import { contacts } from "./content";
import ContactForm from "./ContactForm";

export const metadata = { title: "Контакты" };

export default function ContactsPage() {
  const { emergency, offices, reception } = contacts;

  return (
    <PageShell active="contacts">
      {/* Заголовок страницы */}
      <div className="flex items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-[14px]">
        <h1 className="m-0 text-[36px] uppercase tracking-[.02em]">{contacts.title}</h1>
        <span className="text-xs" style={{ color: muted(50) }}>
          {contacts.subtitle}
        </span>
      </div>

      {/* Экстренная помощь — три карточки */}
      <section
        aria-label={emergency.ariaLabel}
        className="mt-6 grid grid-cols-3 gap-[14px] max-[920px]:grid-cols-1"
      >
        {/* Угроза жизни — 112 */}
        <div className="blueprint p-5" style={{ borderTop: "3px solid var(--hz-critical)" }}>
          <h6 className="m-0 mb-1.5" style={{ color: muted(55) }}>
            {emergency.critical.kicker}
          </h6>
          <a
            href={emergency.critical.phoneHref}
            className="text-[34px] font-semibold no-underline [font-family:var(--font-heading)]"
            style={{ color: "var(--hz-critical)" }}
          >
            {emergency.critical.phone}
          </a>
          <p className="mb-0 mt-1.5 text-[12.5px] leading-[1.5]" style={{ color: muted(62) }}>
            {emergency.critical.note}
          </p>
        </div>

        {/* Телефон доверия */}
        <div className="blueprint p-5">
          <h6 className="m-0 mb-1.5" style={{ color: muted(55) }}>
            {emergency.trust.kicker}
          </h6>
          <a
            href={emergency.trust.phoneHref}
            className="text-[22px] font-semibold no-underline [font-family:var(--font-heading)]"
            style={{ color: "var(--color-accent-700)" }}
          >
            {emergency.trust.phone}
          </a>
          <p className="mb-0 mt-1.5 text-[12.5px] leading-[1.5]" style={{ color: muted(62) }}>
            {emergency.trust.note}
          </p>
        </div>

        {/* Центральный аппарат — адрес */}
        <div className="blueprint p-5">
          <h6 className="m-0 mb-1.5" style={{ color: muted(55) }}>
            {emergency.hq.kicker}
          </h6>
          <p className="m-0 text-[13.5px] leading-[1.6]">
            {emergency.hq.address}
            <br />
            <a href={emergency.hq.emailHref} style={{ color: "var(--color-accent-700)" }}>
              {emergency.hq.email}
            </a>
            {" · "}
            {emergency.hq.hours}
          </p>
        </div>
      </section>

      {/* Региональные управления + электронная приёмная */}
      <div className="mt-10 grid grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)] items-start gap-8 max-[920px]:grid-cols-1">
        <section aria-label={offices.ariaLabel} className="min-w-0">
          <div className="mb-1.5 flex items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-[10px]">
            <h2 className="m-0 text-[23px] uppercase tracking-[.02em]">{offices.title}</h2>
          </div>
          {offices.rows.map((o) => (
            <div
              key={o.email}
              className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] items-baseline gap-[14px] border-b border-[var(--color-divider)] px-0.5 py-4 max-[560px]:grid-cols-1"
            >
              <div>
                <span className="block text-[17px] font-semibold [font-family:var(--font-heading)]">
                  {o.name}
                </span>
                <span className="text-[12.5px]" style={{ color: muted(58) }}>
                  {o.head}
                </span>
              </div>
              <div className="text-[13px] leading-[1.5]" style={{ color: muted(70) }}>
                {o.address}
              </div>
              <div className="text-[13px] leading-[1.5]">
                <a
                  href={`tel:${o.telHref}`}
                  className="no-underline"
                  style={{ color: "var(--color-accent-700)" }}
                >
                  {o.tel}
                </a>
                <span className="block" style={{ color: muted(58) }}>
                  {o.email}
                </span>
              </div>
            </div>
          ))}
        </section>

        <aside className="blueprint flex flex-col gap-3 p-[22px]">
          <h2 className="m-0 text-[21px] uppercase tracking-[.02em]">{reception.title}</h2>
          <p className="m-0 text-[13px] leading-[1.55]" style={{ color: muted(65) }}>
            {reception.intro}
          </p>
          <ContactForm reception={reception} />
        </aside>
      </div>
    </PageShell>
  );
}
