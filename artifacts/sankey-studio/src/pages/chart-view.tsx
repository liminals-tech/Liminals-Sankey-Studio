import { useEffect, useState } from "react";
import { Check, Code2, Flag, Lock, Minus, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { BrandMark } from "@/components/studio/BrandMark";
import { ReportDialog } from "@/components/studio/ReportDialog";
import { SankeyCanvas } from "@/components/studio/SankeyCanvas";
import { fetchGalleryItem, galleryEmbedUrl, hasReportedGalleryItem, myGalleryVote, voteOnGalleryItem, type GalleryItem } from "@/lib/gallery";
import { buildSankeyModel } from "@/lib/sankey";

type LoadState = { status: "loading" } | { status: "not-found" } | { status: "ready"; item: GalleryItem };

export default function ChartViewPage({ params }: { params: { chartId: string } }) {
  const { chartId } = params;
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [layoutKey, setLayoutKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });
    fetchGalleryItem(chartId).then((item) => {
      if (!active) return;
      setState(item ? { status: "ready", item } : { status: "not-found" });
    });
    return () => { active = false; };
  }, [chartId]);

  const vote = async (item: GalleryItem, value: 1 | -1) => {
    const result = await voteOnGalleryItem(item.chartId, value);
    if (result.ok) setState({ status: "ready", item: { ...item, upvotes: result.upvotes, downvotes: result.downvotes } });
  };

  const copyEmbedCode = async (item: GalleryItem) => {
    const code = `<img src="${galleryEmbedUrl(item.chartId)}" alt="${item.title || "Untitled story"}" />`;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be blocked by the browser; nothing to recover from here.
    }
  };

  return (
    <div className="studio-noise flex min-h-[100dvh] flex-col bg-[hsl(var(--background))]">
      <header className="flex h-[67px] shrink-0 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.92)] px-4 backdrop-blur-md sm:px-7">
        <button onClick={() => setLocation("/")} aria-label="Back to the editor"><BrandMark /></button>
        <button onClick={() => setLocation("/")} className="rounded-md bg-[hsl(var(--primary))] px-3 py-2 text-[11px] font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:brightness-95" data-testid="button-open-editor">Open the editor</button>
      </header>
      <main className="mx-auto w-full max-w-[1160px] flex-1 px-4 py-7 sm:px-7">
        {state.status === "loading" && <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading chart…</p>}
        {state.status === "not-found" && <div className="fade-up"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">Not found</p><h1 className="mt-1 font-serif text-3xl">This chart isn't in the shared gallery</h1><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">It may have been removed by whoever created it, or the link is incorrect.</p></div>}
        {state.status === "ready" && (() => {
          const { item } = state;
          const model = buildSankeyModel(item.rows, item.levels, item.valueColumn, item.reverse, item.palette, item.nodeWidth, item.nodeImageColumn, item.nodeAssets, item.nodeOrder);
          const myVote = myGalleryVote(item.chartId);
          const score = item.upvotes - item.downvotes;
          return <>
            <div className="fade-up mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">{item.isPrivate && <Lock size={11} />} {item.isPrivate ? "Private — only visible to you" : "From the shared gallery"}</p>
                <h1 className="mt-1 max-w-[600px] font-serif text-[clamp(1.8rem,3.6vw,3rem)] leading-[.98] tracking-[-.03em]">{item.title || "Untitled story"}</h1>
                {item.description && <p className="mt-2 max-w-xl text-sm text-[hsl(var(--muted-foreground))]">{item.description}</p>}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1">
                  <button onClick={() => vote(item, 1)} aria-label="Upvote this chart" aria-pressed={myVote === 1} className={`grid size-7 place-items-center rounded ${myVote === 1 ? "bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"}`} data-testid="button-view-upvote"><Plus size={13} /></button>
                  <span className="min-w-[20px] text-center font-mono text-[11px] text-[hsl(var(--muted-foreground))]" data-testid="text-view-score">{score > 0 ? `+${score}` : score}</span>
                  <button onClick={() => vote(item, -1)} aria-label="Downvote this chart" aria-pressed={myVote === -1} className={`grid size-7 place-items-center rounded ${myVote === -1 ? "bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"}`} data-testid="button-view-downvote"><Minus size={13} /></button>
                </div>
                {!item.isPrivate && <button onClick={() => copyEmbedCode(item)} className="flex items-center gap-1.5 rounded-md border border-[hsl(var(--border))] px-3.5 py-2 text-xs font-semibold text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))]" data-testid="button-copy-embed">{copied ? <Check size={14} /> : <Code2 size={14} />} {copied ? "Copied" : "Copy embed code"}</button>}
                {!item.isPrivate && !hasReportedGalleryItem(item.chartId) && <button onClick={() => setReporting(true)} aria-label="Report this chart" title="Report this chart" className="grid size-9 place-items-center rounded-md border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]" data-testid="button-report-chart"><Flag size={14} /></button>}
                <button onClick={() => setLocation(`/?chart=${encodeURIComponent(item.chartId)}`)} className="rounded-md bg-[hsl(var(--primary))] px-3.5 py-2 text-xs font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:brightness-95" data-testid="button-use-as-starting-point">Use as a starting point</button>
              </div>
            </div>
            <SankeyCanvas model={model} title={item.title || "Untitled story"} subtitle={item.description} background={item.background} backgroundImage={item.backgroundImage} transparent={item.transparent} showLabels={item.showLabels} notation={item.notation} linkOpacity={item.linkOpacity} selectedId={selectedId} onSelect={(id) => setSelectedId(id)} onResetLayout={() => { setSelectedId(null); setLayoutKey((key) => key + 1); }} />
            <p className="mt-3 text-[10px] leading-relaxed text-[hsl(var(--muted-foreground))]">{item.isPrivate ? "Only you can view this chart, verified by your signed-in session — it never appears in the shared gallery and has no public embed snapshot." : "Anyone with this link can view and vote on this chart. Every calculation stays on your device — nothing about how you view this page is sent anywhere beyond the vote you cast. The embed code points at a static snapshot taken when this chart was shared, so it stays put even if the chart is later changed."}</p>
            {reporting && <ReportDialog chartId={item.chartId} title={item.title} onClose={() => setReporting(false)} onReported={() => setReporting(false)} />}
            <div className="mt-6 flex gap-3 text-[10px] text-[hsl(var(--muted-foreground))]"><button onClick={() => setLocation("/privacy")} className="hover:underline">Privacy</button><span>·</span><button onClick={() => setLocation("/terms")} className="hover:underline">Terms</button></div>
          </>;
        })()}
      </main>
    </div>
  );
}
