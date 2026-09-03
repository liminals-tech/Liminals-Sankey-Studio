import { ChevronLeft, ChevronRight, Database, FileUp, Plus, RotateCcw, Table2 } from "lucide-react";
import type { DatasetTemplate } from "@/data/templates";

type Props = {
  templates: DatasetTemplate[];
  activeId: string;
  onSelect: (template: DatasetTemplate) => void;
  onImport: () => void;
  onPaste: () => void;
  onReset: () => void;
  collapsed: boolean;
  onToggle: () => void;
};

export function DatasetRail({ templates, activeId, onSelect, onImport, onPaste, onReset, collapsed, onToggle }: Props) {
  if (collapsed) {
    return (
      <aside className="flex w-full shrink-0 items-center justify-between border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] px-3 py-2 text-[hsl(var(--sidebar-foreground))] lg:w-[52px] lg:flex-col lg:justify-start lg:px-2 lg:py-4" aria-label="Collapsed examples menu">
        <span className="hidden font-mono text-[9px] uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.5)] lg:block [writing-mode:vertical-rl]">Examples</span>
        <button onClick={onToggle} className="grid size-8 place-items-center rounded-md bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground)/.75)] transition hover:text-[hsl(var(--sidebar-foreground))]" aria-label="Expand examples menu" data-testid="button-expand-datasets"><ChevronRight size={15} /></button>
      </aside>
    );
  }
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] lg:w-[244px] lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-5 py-5">
        <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--sidebar-foreground)/.56)]">Explore a question</div>
        <div className="flex items-center gap-2">
          <button onClick={onReset} className="flex items-center gap-1.5 text-[11px] text-[hsl(var(--sidebar-foreground)/.55)] transition hover:text-[hsl(var(--sidebar-foreground))]" data-testid="button-reset-editor">
            <RotateCcw size={12} /> <span className="hidden sm:inline">Reset</span>
          </button>
          <button onClick={onToggle} className="grid size-8 place-items-center rounded-md bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground)/.7)] transition hover:text-[hsl(var(--sidebar-foreground))]" aria-label="Collapse examples menu" data-testid="button-collapse-datasets">
            <ChevronLeft size={14} />
          </button>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:block lg:space-y-1 lg:overflow-visible lg:px-3" aria-label="Example datasets">
        {templates.map((template, index) => {
          const active = template.id === activeId;
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className={`group min-w-[180px] rounded-lg px-3 py-2.5 text-left transition lg:w-full ${active ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]" : "text-[hsl(var(--sidebar-foreground)/.66)] hover:bg-[hsl(var(--sidebar-accent)/.68)] hover:text-[hsl(var(--sidebar-foreground))]"}`}
              data-testid={`button-template-${template.id}`}
            >
              <span className={`mr-2 inline-flex size-5 items-center justify-center rounded text-[10px] font-medium ${active ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : "bg-[hsl(var(--sidebar-foreground)/.09)] text-[hsl(var(--sidebar-foreground)/.58)]"}`}>{String(index + 1).padStart(2, "0")}</span>
              <span className="align-middle text-[12px] font-medium">{template.title}</span>
              <span className="mt-1 block pl-7 text-[10px] text-[hsl(var(--sidebar-foreground)/.42)]">{template.eyebrow}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto hidden border-t border-[hsl(var(--sidebar-border))] p-4 lg:block">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-medium text-[hsl(var(--sidebar-foreground)/.66)]"><Database size={13} /> Your data</div>
        <button onClick={onImport} className="mb-2 flex w-full items-center gap-2 rounded-md border border-dashed border-[hsl(var(--sidebar-border))] px-3 py-2 text-left text-[11px] text-[hsl(var(--sidebar-foreground)/.65)] transition hover:border-[hsl(var(--sidebar-primary)/.7)] hover:text-[hsl(var(--sidebar-foreground))]" data-testid="button-import-file">
          <FileUp size={13} /> Import a file
        </button>
        <button onClick={onPaste} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[11px] text-[hsl(var(--sidebar-foreground)/.65)] transition hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]" data-testid="button-paste-data">
          <Plus size={13} /> Paste tabular data
        </button>
      </div>
      <div className="flex gap-2 px-4 pb-4 lg:hidden">
        <button onClick={onImport} className="flex items-center gap-1.5 rounded-md border border-[hsl(var(--sidebar-border))] px-3 py-2 text-[11px] text-[hsl(var(--sidebar-foreground)/.72)]" data-testid="button-import-file-mobile"><FileUp size={13} /> Import</button>
        <button onClick={onPaste} className="flex items-center gap-1.5 rounded-md bg-[hsl(var(--sidebar-accent))] px-3 py-2 text-[11px] text-[hsl(var(--sidebar-foreground)/.72)]" data-testid="button-paste-data-mobile"><Table2 size={13} /> Paste</button>
      </div>
    </aside>
  );
}