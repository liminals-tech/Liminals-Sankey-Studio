import { ChevronLeft, ChevronRight, Database, FileUp, GalleryHorizontalEnd, Link2, Minus, Plus, Table2, Trash2 } from "lucide-react";
import { useMemo } from "react";
import type { GalleryItem } from "@/lib/gallery";
import { modelToSvg } from "@/lib/export";
import { buildSankeyModel } from "@/lib/sankey";

// One real row's values across every level, e.g. "Revenue → Gross margin →
// People" — a quick, concrete sense of what kind of data this chart holds,
// shown above the title rather than relying on the title alone to convey it.
function sampleFlowPath(item: GalleryItem): string {
  const row = item.rows[0];
  if (!row) return "";
  return item.levels.map((level) => String(row[level] ?? "")).filter(Boolean).join(" → ");
}

function galleryItemPermalink(chartId: string): string {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${window.location.origin}${basePath}/chart/${encodeURIComponent(chartId)}`;
}

function relativeTime(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

// Rendered as an <img> (data URL), not injected into the DOM: gallery items
// come from anonymous, unmoderated visitors, and an <img>-loaded SVG cannot
// execute embedded scripts the way inline markup could.
function GalleryThumbnail({ item }: { item: GalleryItem }) {
  const src = useMemo(() => {
    const model = buildSankeyModel(item.rows, item.levels, item.valueColumn, item.reverse, item.palette, item.nodeWidth, item.nodeImageColumn, item.nodeAssets, item.nodeOrder);
    const svg = modelToSvg(model, { title: "", subtitle: "", background: item.background, transparent: item.transparent, showLabels: false, notation: item.notation, backgroundImage: item.backgroundImage });
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }, [item]);
  return <img src={src} alt="" className="h-9 w-16 shrink-0 rounded border border-[hsl(var(--sidebar-border))] object-cover" style={{ backgroundColor: item.transparent ? "transparent" : item.background }} />;
}

type Props = {
  onImport: () => void;
  onPaste: () => void;
  collapsed: boolean;
  onToggle: () => void;
  gallery: GalleryItem[];
  galleryLoading: boolean;
  activeGalleryId?: string;
  onSelectGallery: (item: GalleryItem) => void;
  onDeleteGallery: (chartId: string) => void;
  canDeleteGallery: (chartId: string) => boolean;
  onVoteGallery: (chartId: string, vote: 1 | -1) => void;
  myGalleryVote: (chartId: string) => 1 | -1 | 0;
};

export function DatasetRail({ onImport, onPaste, collapsed, onToggle, gallery, galleryLoading, activeGalleryId, onSelectGallery, onDeleteGallery, canDeleteGallery, onVoteGallery, myGalleryVote }: Props) {
  if (collapsed) {
    return (
      <aside className="flex w-full shrink-0 items-center justify-between border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] px-3 py-2 text-[hsl(var(--sidebar-foreground))] lg:w-[52px] lg:flex-col lg:justify-start lg:px-2 lg:py-4" aria-label="Collapsed gallery menu">
        <span className="hidden font-mono text-[9px] uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.5)] lg:block [writing-mode:vertical-rl]">Gallery</span>
        <button onClick={onToggle} className="grid size-8 place-items-center rounded-md bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground)/.75)] transition hover:text-[hsl(var(--sidebar-foreground))]" aria-label="Expand gallery menu" data-testid="button-expand-datasets"><ChevronRight size={15} /></button>
      </aside>
    );
  }
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] lg:w-[244px] lg:border-b-0 lg:border-r">
      <div className="px-3 py-4">
        <div className="mb-2 flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.56)]"><GalleryHorizontalEnd size={12} /> Shared gallery <span className="font-mono text-[9px]">({gallery.length})</span></div>
          <button onClick={onToggle} className="grid size-8 place-items-center rounded-md bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground)/.7)] transition hover:text-[hsl(var(--sidebar-foreground))]" aria-label="Collapse gallery menu" data-testid="button-collapse-datasets">
            <ChevronLeft size={14} />
          </button>
        </div>
        {galleryLoading ? <p className="px-2 text-[10px] leading-relaxed text-[hsl(var(--sidebar-foreground)/.42)]">Loading the shared gallery…</p> : gallery.length === 0 ? <p className="px-2 text-[10px] leading-relaxed text-[hsl(var(--sidebar-foreground)/.42)]">Export a chart to add it here for everyone to see and reuse.</p> : <div className="space-y-1.5">
          {gallery.map((item) => { const myVote = myGalleryVote(item.chartId); const score = item.upvotes - item.downvotes; return (
          <div key={item.chartId} className={`group flex items-start gap-2 rounded-lg p-2 transition ${activeGalleryId === item.chartId ? "bg-[hsl(var(--sidebar-accent))]" : "hover:bg-[hsl(var(--sidebar-accent)/.68)]"}`}>
            <GalleryThumbnail item={item} />
            <div className="min-w-0 flex-1">
              <button onClick={() => onSelectGallery(item)} className="block w-full text-left" title="Use this chart as a starting point" data-testid={`button-gallery-${item.chartId}`}>
                {sampleFlowPath(item) && <span className="block truncate font-mono text-[9px] text-[hsl(var(--sidebar-foreground)/.5)]" data-testid={`text-flow-${item.chartId}`}>{sampleFlowPath(item)}</span>}
                <span className="block truncate text-[12px] font-medium text-[hsl(var(--sidebar-foreground)/.8)]">{item.title || "Untitled story"}</span>
                <span className="mt-0.5 block truncate text-[9px] text-[hsl(var(--sidebar-foreground)/.42)]">Use as a starting point · {relativeTime(item.createdAt)}</span>
              </button>
              <div className="mt-1 flex items-center gap-1">
                <button onClick={(event) => { event.stopPropagation(); onVoteGallery(item.chartId, 1); }} aria-label="Upvote this chart" aria-pressed={myVote === 1} className={`grid size-5 place-items-center rounded ${myVote === 1 ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))]" : "text-[hsl(var(--sidebar-foreground)/.4)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"}`} data-testid={`button-upvote-${item.chartId}`}><Plus size={10} /></button>
                <span className="min-w-[14px] text-center font-mono text-[9px] text-[hsl(var(--sidebar-foreground)/.55)]" data-testid={`text-score-${item.chartId}`}>{score > 0 ? `+${score}` : score}</span>
                <button onClick={(event) => { event.stopPropagation(); onVoteGallery(item.chartId, -1); }} aria-label="Downvote this chart" aria-pressed={myVote === -1} className={`grid size-5 place-items-center rounded ${myVote === -1 ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]" : "text-[hsl(var(--sidebar-foreground)/.4)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"}`} data-testid={`button-downvote-${item.chartId}`}><Minus size={10} /></button>
                <a href={galleryItemPermalink(item.chartId)} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} aria-label="Open a shareable link to this chart" title="Open a shareable link to this chart" className="ml-1 grid size-5 place-items-center rounded text-[hsl(var(--sidebar-foreground)/.4)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]" data-testid={`link-permalink-${item.chartId}`}><Link2 size={10} /></a>
              </div>
            </div>
            {canDeleteGallery(item.chartId) && <button onClick={(event) => { event.stopPropagation(); onDeleteGallery(item.chartId); }} className="grid size-7 shrink-0 place-items-center rounded text-[hsl(var(--sidebar-foreground)/.4)] opacity-0 transition hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))] group-hover:opacity-100 focus:opacity-100" aria-label={`Delete ${item.title || "saved chart"}`} data-testid={`button-delete-gallery-${item.chartId}`}><Trash2 size={12} /></button>}
          </div>
          ); })}
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