import PageShell from "@/components/public/PageShell";
import { muted } from "@/components/public/ui";
import { fetchDocuments } from "@/lib/api";
import { documents } from "./content";
import DocumentsTable from "./DocumentsTable";

export const metadata = { title: "Документы" };

// ISR: библиотека документов перечитывается из CMS не чаще раза в минуту.
export const revalidate = 60;

export default async function DocumentsPage() {
  const docs = await fetchDocuments();

  return (
    <PageShell active="documents">
      <div className="flex items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-[14px]">
        <h1 className="m-0 text-[36px] uppercase tracking-[.02em]">
          {documents.title}
        </h1>
        <span className="text-xs" style={{ color: muted(50) }}>
          {documents.subtitle}
        </span>
      </div>

      <DocumentsTable content={documents} docs={docs} />
    </PageShell>
  );
}
