import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/public/PageShell";
import { muted } from "@/components/public/ui";
import { fetchPage, fetchPages } from "@/lib/api";

export const revalidate = 60;

export async function generateStaticParams() {
  const pages = await fetchPages();
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await fetchPage(slug);

  return { title: page?.title ?? "Страница" };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await fetchPage(slug);

  if (!page) {
    notFound();
  }

  const paragraphs = (page.body ?? "")
    .split(/\n{2,}|\r?\n/)
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <PageShell mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-6 max-[920px]:px-4">
      <nav className="text-[12.5px]" style={{ color: muted(55) }} aria-label="Хлебные крошки">
        <Link href="/" style={{ color: "var(--color-accent-700)" }}>
          Главная
        </Link>
        {" · "}
        <span>{page.title}</span>
      </nav>

      <article className="mt-5 max-w-[72ch]">
        <h1 className="m-0 text-[32px] leading-[1.14] max-[560px]:text-[26px]">
          {page.title}
        </h1>
        {page.updated && (
          <p
            className="mb-6 mt-2 border-b border-[var(--color-divider)] pb-3 text-[12.5px]"
            style={{ color: muted(55) }}
          >
            Обновлено: {page.updated}
          </p>
        )}

        {paragraphs.length > 0 ? (
          paragraphs.map((text, i) => (
            <p key={i} className="mb-4 text-[15px] leading-[1.7]">
              {text}
            </p>
          ))
        ) : (
          <p className="text-[15px] leading-[1.7]" style={{ color: muted(60) }}>
            Содержание страницы готовится.
          </p>
        )}
      </article>
    </PageShell>
  );
}
