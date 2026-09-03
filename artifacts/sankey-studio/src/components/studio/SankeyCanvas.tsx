import { Maximize2, Minus, Pause, Play, Plus, RotateCcw } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { SankeyModel } from "@/lib/sankey";

type Props = {
  model: SankeyModel;
  title: string;
  subtitle: string;
  background: string;
  backgroundImage?: string;
  transparent: boolean;
  showLabels: boolean;
  notation: "full" | "compact" | "percent";
  linkOpacity: number;
  selectedId: string | null;
  onSelect: (id: string | null, detail?: { kind: "node" | "link"; label: string; value: number; from?: string; to?: string }) => void;
  onResetLayout: () => void;
};

export function SankeyCanvas({ model, title, subtitle, background, backgroundImage, transparent, showLabels, notation, linkOpacity, selectedId, onSelect, onResetLayout }: Props) {
  const [zoom, setZoom] = useState(1);
  const [animated, setAnimated] = useState(true);
  const [animationRun, setAnimationRun] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const selectedNode = useMemo(() => model.nodes.find((node) => node.id === selectedId), [model.nodes, selectedId]);
  const selectedLink = useMemo(() => model.links.find((link) => link.id === selectedId), [model.links, selectedId]);
  const safe = (value: number) => Number.isFinite(value) ? value : 0;
  const format = (value: number) => notation === "percent" ? `${((safe(value) / Math.max(model.total, 1)) * 100).toFixed(1)}%` : notation === "compact" ? new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(safe(value)) : new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(safe(value));
  const isNodeDimmed = (id: string) => Boolean(selectedId && selectedId !== id && !selectedLink?.source.id.includes(id) && !selectedLink?.target.id.includes(id) && !selectedNode);
  const fitChart = () => {
    setZoom(1);
    canvasRef.current?.scrollTo({ left: 0, top: 0, behavior: "auto" });
  };
  return (
    <section className="min-h-[430px] flex-1 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-sm)]" data-testid="panel-sankey-visualization">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[hsl(var(--border))] px-5 py-4 sm:px-7">
        <div><div className="flex items-center gap-2"><span className="size-2 rounded-full bg-[hsl(var(--chart-2))]" /><span className="font-mono text-[10px] uppercase tracking-[.17em] text-[hsl(var(--muted-foreground))]">Live preview</span></div><h1 className="mt-1 font-serif text-[clamp(1.45rem,2vw,2.1rem)] leading-tight tracking-[-.02em]" data-testid="text-chart-title">{title}</h1><p className="mt-1 max-w-xl text-xs text-[hsl(var(--muted-foreground))]" data-testid="text-chart-subtitle">{subtitle}</p></div>
        <div className="flex items-center gap-1 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background)/.6)] p-1">
          <button onClick={() => { setAnimated(!animated); setAnimationRun((run) => run + 1); }} className={`grid size-7 place-items-center rounded ${animated ? "bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"} hover:bg-[hsl(var(--muted))]`} aria-label={animated ? "Pause flow animation" : "Play flow animation"} data-testid="button-toggle-animation">{animated ? <Pause size={13} /> : <Play size={13} />}</button><button onClick={() => { setAnimated(true); setAnimationRun((run) => run + 1); }} className="grid size-7 place-items-center rounded text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]" aria-label="Replay flow animation" data-testid="button-replay-animation"><RotateCcw size={13} /></button>
          <button onClick={() => setZoom(Math.max(.72, zoom - .1))} className="grid size-7 place-items-center rounded text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]" aria-label="Zoom out" data-testid="button-zoom-out"><Minus size={13} /></button><span className="min-w-[43px] text-center font-mono text-[10px] text-[hsl(var(--muted-foreground))]">{Math.round(zoom * 100)}%</span><button onClick={() => setZoom(Math.min(1.35, zoom + .1))} className="grid size-7 place-items-center rounded text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]" aria-label="Zoom in" data-testid="button-zoom-in"><Plus size={13} /></button><button onClick={fitChart} className="flex h-7 items-center gap-1 rounded px-1.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]" aria-label="Fit chart" title="Fit chart to available space" data-testid="button-fit-chart"><Maximize2 size={13} /><span className="text-[10px]">Fit</span></button>
          <button onClick={onResetLayout} className="ml-1 grid size-7 place-items-center rounded text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]" aria-label="Reset layout" data-testid="button-reset-layout"><RotateCcw size={13} /></button>
        </div>
      </div>
      <div ref={canvasRef} className="studio-grid relative min-h-[355px] overflow-auto p-3 sm:p-5" style={{ backgroundColor: transparent ? "transparent" : background }}>
        {model.nodes.length < 2 ? <div className="grid min-h-[330px] place-items-center text-center"><div><p className="font-serif text-xl">Nothing to draw yet.</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Map at least two text columns and a numeric value.</p></div></div> : <svg viewBox="0 0 1220 560" className="sankey-animate mx-auto block h-auto min-w-0 transition-transform duration-200" style={{ width: `${zoom * 100}%`, minWidth: zoom > 1 ? "690px" : undefined }} role="img" aria-label={`Sankey diagram: ${title}`} data-testid="svg-sankey">
          <rect x="0" y="0" width="1220" height="560" fill="transparent" onClick={() => onSelect(null)} />
          {backgroundImage && <image href={backgroundImage} x="0" y="0" width="1220" height="560" preserveAspectRatio="xMidYMid slice" opacity=".16" pointerEvents="none" aria-label="Chart background image"><title>Chart background image</title></image>}
          <g aria-label="Flow links">
            {model.links.map((link, index) => {
              const active = selectedId === link.id;
              const dimmed = Boolean(selectedId && !active && !selectedNode?.id.includes(link.source.id) && !selectedNode?.id.includes(link.target.id));
              return <path key={`${link.id}-${animationRun}`} d={link.path} fill={link.source.color} opacity={active ? .72 : dimmed ? .08 : linkOpacity} stroke={active ? link.source.color : "none"} strokeWidth={active ? 1 : 0} style={{ animationDelay: `${index * 90}ms`, animationPlayState: animated ? "running" : "paused" }} className="sankey-link cursor-pointer transition-opacity duration-200" onClick={(event) => { event.stopPropagation(); onSelect(active ? null : link.id, { kind: "link", label: `${link.source.label} to ${link.target.label}`, value: link.value, from: link.source.label, to: link.target.label }); }} data-testid={`link-flow-${link.id}`}><title>{link.source.label} to {link.target.label}: {format(link.value)}</title></path>;
            })}
          </g>
          <g aria-label="Flow nodes">
            {model.nodes.map((node, index) => <g key={`${node.id}-${animationRun}`} className="sankey-node cursor-pointer" style={{ animationDelay: `${index * 65}ms`, animationPlayState: animated ? "running" : "paused" }} onClick={(event) => { event.stopPropagation(); onSelect(selectedId === node.id ? null : node.id, { kind: "node", label: node.label, value: node.value }); }} opacity={isNodeDimmed(node.id) ? .22 : 1} data-testid={`node-flow-${node.id}`}><rect x={node.x} y={node.y} width={node.w} height={node.h} rx={3} fill={node.color} className="transition-opacity duration-200" />{node.image && <image href={node.image} x={node.x - 5} y={node.y + Math.max(0, node.h / 2 - 14)} width={node.w + 10} height={Math.min(28, node.h)} preserveAspectRatio="xMidYMid slice" opacity=".9" aria-label={`${node.label} image`}><title>{node.label} image</title></image>}<text x={node.x < 500 ? node.x - 12 : node.x + node.w + 12} y={node.y + node.h / 2 - 1} textAnchor={node.x < 500 ? "end" : "start"} fill="hsl(var(--foreground))" fontFamily="DM Sans, sans-serif" fontSize="14" fontWeight="600">{showLabels ? node.label : ""}</text><text x={node.x < 500 ? node.x - 12 : node.x + node.w + 12} y={node.y + node.h / 2 + 15} textAnchor={node.x < 500 ? "end" : "start"} fill="hsl(var(--muted-foreground))" fontFamily="DM Mono, monospace" fontSize="10">{showLabels ? format(node.value) : ""}</text></g>)}
          </g>
          <g pointerEvents="none"><text x="70" y="535" fill="hsl(var(--muted-foreground))" fontFamily="DM Mono, monospace" fontSize="10" letterSpacing="1">{model.levels.map((level) => level.toUpperCase()).join("   →   ")}</text></g>
        </svg>}
      </div>
      <div className="flex min-h-[48px] items-center border-t border-[hsl(var(--border))] px-5 py-3 sm:px-7" data-testid="status-chart-selection">
        {selectedNode ? <><span className="mr-2 size-2.5 rounded-sm" style={{ backgroundColor: selectedNode.color }} /><span className="text-xs font-semibold">{selectedNode.label}</span><span className="ml-2 font-mono text-[11px] text-[hsl(var(--muted-foreground))]">{format(selectedNode.value)} total</span><button onClick={() => onSelect(null)} className="ml-auto text-[11px] text-[hsl(var(--primary))] hover:underline" data-testid="button-clear-selection">Clear</button></> : selectedLink ? <><span className="text-xs font-semibold">{selectedLink.source.label} → {selectedLink.target.label}</span><span className="ml-2 font-mono text-[11px] text-[hsl(var(--muted-foreground))]">{format(selectedLink.value)} flow</span><button onClick={() => onSelect(null)} className="ml-auto text-[11px] text-[hsl(var(--primary))] hover:underline" data-testid="button-clear-selection-link">Clear</button></> : <span className="text-[11px] text-[hsl(var(--muted-foreground))]">Click a node or flow to inspect it</span>}
      </div>
    </section>
  );
}