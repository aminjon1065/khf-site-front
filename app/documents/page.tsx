import PageShell from "@/components/public/PageShell";
import { muted } from "@/components/public/ui";
import { documents } from "./content";
import DocumentsTable from "./DocumentsTable";

export const metadata = { title: "Документы" };

export default function DocumentsPage() {
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

      <DocumentsTable content={documents} />
    </PageShell>
  );
}
