import { ChevronLeft, ChevronRight, Database, FileUp, GalleryHorizontalEnd, Plus, RotateCcw, Table2, Trash2 } from "lucide-react";
import type { DatasetTemplate } from "@/data/templates";
import type { GalleryItem } from "@/lib/gallery";

type Props = {
  templates: DatasetTemplate[];
  activeId: string;
  onSelect: (template: DatasetTemplate) => void;
  onImport: () => void;
  onPaste: () => void;
  onReset: () => void;
  collapsed: boolean;
  onToggle: () => void;
  gallery: GalleryItem[];
  galleryLoading: boolean;
  activeGalleryId?: string;
  onSelectGallery: (item: GalleryItem) => void;
  onDeleteGallery: (chartId: string) => void;
  canDeleteGallery: (chartId: string) => boolean;
};

export function DatasetRail({ templates, activeId, onSelect, onImport, onPaste, onReset, collapsed, onToggle, gallery, galleryLoading, activeGalleryId, onSelectGallery, onDeleteGallery, canDeleteGallery }: Props) {
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
      <div className="border-t border-[hsl(var(--sidebar-border))] px-3 py-4">
        <div className="mb-2 flex items-center gap-2 px-2 text-[10px] font-medium uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.56)]"><GalleryHorizontalEnd size={12} /> Shared gallery <span className="font-mono text-[9px]">({gallery.length})</span></div>
        {galleryLoading ? <p className="px-2 text-[10px] leading-relaxed text-[hsl(var(--sidebar-foreground)/.42)]">Loading the shared gallery…</p> : gallery.length === 0 ? <p className="px-2 text-[10px] leading-relaxed text-[hsl(var(--sidebar-foreground)/.42)]">Export a chart to add it here for everyone to see and reuse.</p> : <div className="space-y-1.5">
          {gallery.map((item) => <div key={item.chartId} className={`group flex items-center gap-1 rounded-lg transition ${activeGalleryId === item.chartId ? "bg-[hsl(var(--sidebar-accent))]" : "hover:bg-[hsl(var(--sidebar-accent)/.68)]"}`}>
            <button onClick={() => onSelectGallery(item)} className="min-w-0 flex-1 px-3 py-2.5 text-left" data-testid={`button-gallery-${item.chartId}`}>
              <span className="block truncate text-[12px] font-medium text-[hsl(var(--sidebar-foreground)/.8)]">{item.title || "Untitled story"}</span>
              <span className="mt-1 block truncate font-mono text-[9px] text-[hsl(var(--sidebar-foreground)/.42)]">{item.chartId}</span>
            </button>
            {canDeleteGallery(item.chartId) && <button onClick={(event) => { event.stopPropagation(); onDeleteGallery(item.chartId); }} className="mr-2 grid size-7 shrink-0 place-items-center rounded text-[hsl(var(--sidebar-foreground)/.4)] opacity-0 transition hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))] group-hover:opacity-100 focus:opacity-100" aria-label={`Delete ${item.title || "saved chart"}`} data-testid={`button-delete-gallery-${item.chartId}`}><Trash2 size={12} /></button>}
          </div>)}
        </div>}
      </div>
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