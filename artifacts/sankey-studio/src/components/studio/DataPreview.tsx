import { CheckCircle2, ChevronDown, FileSpreadsheet, TriangleAlert } from "lucide-react";
import { useState } from "react";
import type { ImportSummary } from "@/lib/data";
import type { Row } from "@/data/templates";

type Props = { rows: Row[]; columns: string[]; summary?: ImportSummary; onImport: () => void };

export function DataPreview({ rows, columns, summary, onImport }: Props) {
  const [expanded, setExpanded] = useState(false);
  const shownRows = expanded ? rows.slice(0, 8) : rows.slice(0, 3);
  return <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-xs)]" data-testid="panel-imported-data">
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
      <div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-md bg-[hsl(var(--secondary))] text-[hsl(var(--chart-2))]"><FileSpreadsheet size={16} /></span><div><div className="flex items-center gap-2"><h2 className="text-xs font-semibold">Imported data</h2>{summary?.fileName && <span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]">{summary.fileName}</span>}</div><p className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">{rows.length} rows · {columns.length} columns detected</p></div></div>
      <button onClick={onImport} className="rounded-md border border-[hsl(var(--border))] px-2.5 py-1.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--foreground))]" data-testid="button-replace-data">Replace</button>
    </div>
    <div className="flex flex-wrap gap-2 border-y border-[hsl(var(--border))] px-5 py-2.5 sm:px-6"><span className="inline-flex items-center gap-1 text-[10px] text-[hsl(var(--chart-2))]"><CheckCircle2 size={12} /> {summary?.valid ?? rows.length} valid</span><span className="text-[10px] text-[hsl(var(--muted-foreground))]">· {summary?.ignored ?? 0} ignored</span>{summary?.errors.length ? <span className="inline-flex items-center gap-1 text-[10px] text-[hsl(var(--destructive))]"><TriangleAlert size={12} /> {summary.errors.length} issue{summary.errors.length === 1 ? "" : "s"}</span> : null}</div>
    <div className="overflow-x-auto"><table className="w-full min-w-[500px] text-left text-[11px]"><thead><tr className="text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">{columns.slice(0, 6).map((column) => <th key={column} className="px-5 py-2 font-medium sm:px-6">{column}</th>)}</tr></thead><tbody>{shownRows.map((row, index) => <tr key={index} className="border-t border-[hsl(var(--border)/.65)] text-[hsl(var(--foreground)/.78)]" data-testid={`row-preview-${index}`}>{columns.slice(0, 6).map((column) => <td key={column} className="max-w-[170px] truncate px-5 py-2 font-mono text-[10px] sm:px-6">{String(row[column] ?? "")}</td>)}</tr>)}</tbody></table></div>
    {rows.length > 3 && <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-center gap-1 border-t border-[hsl(var(--border))] py-2.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]" data-testid="button-toggle-preview">{expanded ? "Show less" : `Show ${Math.min(rows.length, 8) - 3} more rows`}<ChevronDown size={12} className={expanded ? "rotate-180" : ""} /></button>}
  </section>;
}