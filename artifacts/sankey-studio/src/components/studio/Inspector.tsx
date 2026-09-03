import { ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, Palette, SlidersHorizontal, WandSparkles } from "lucide-react";
import { useState, type ReactNode } from "react";

type Props = {
  columns: string[];
  levels: string[];
  valueColumn: string;
  reverse: boolean;
  setLevels: (levels: string[]) => void;
  setValueColumn: (column: string) => void;
  setReverse: (value: boolean) => void;
  palette: "signal" | "mineral" | "citrus";
  setPalette: (value: "signal" | "mineral" | "citrus") => void;
  background: string;
  setBackground: (value: string) => void;
  transparent: boolean;
  setTransparent: (value: boolean) => void;
  showLabels: boolean;
  setShowLabels: (value: boolean) => void;
  notation: "full" | "compact" | "percent";
  setNotation: (value: "full" | "compact" | "percent") => void;
  linkOpacity: number;
  setLinkOpacity: (value: number) => void;
  nodeWidth: number;
  setNodeWidth: (value: number) => void;
  aspect: string;
  setAspect: (value: string) => void;
  collapsed: boolean;
  onToggle: () => void;
};

function Section({ title, icon, children, openDefault = true }: { title: string; icon: ReactNode; children: ReactNode; openDefault?: boolean }) {
  const [open, setOpen] = useState(openDefault);
  return <section className="border-b border-[hsl(var(--border))] py-4"><button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-left" data-testid={`button-toggle-${title.toLowerCase().replaceAll(" ", "-")}`}><span className="flex items-center gap-2 text-xs font-semibold"><span className="text-[hsl(var(--primary))]">{icon}</span>{title}</span>{open ? <ChevronDown size={14} className="text-[hsl(var(--muted-foreground))]" /> : <ChevronRight size={14} className="text-[hsl(var(--muted-foreground))]" />}</button>{open && <div className="mt-4">{children}</div>}</section>;
}

export function Inspector(props: Props) {
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= props.levels.length) return;
    const next = [...props.levels]; [next[index], next[target]] = [next[target], next[index]]; props.setLevels(next);
  };
  if (props.collapsed) {
    return (
      <aside className="flex w-full shrink-0 items-center justify-between border-t border-[hsl(var(--border))] bg-[hsl(var(--background)/.65)] px-5 py-2 lg:w-[52px] lg:flex-col lg:justify-start lg:px-2 lg:py-4" aria-label="Collapsed chart inspector">
        <span className="hidden font-mono text-[9px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))] lg:block [writing-mode:vertical-rl]">Controls</span>
        <button onClick={props.onToggle} className="grid size-8 place-items-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]" aria-label="Expand chart inspector" data-testid="button-expand-inspector"><ChevronLeft size={15} /></button>
      </aside>
    );
  }
  return <aside className="w-full shrink-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--background)/.65)] px-5 lg:w-[296px] lg:border-l lg:border-t-0 lg:px-5" aria-label="Chart inspector">
    <div className="flex items-center justify-between border-b border-[hsl(var(--border))] py-3">
      <span className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Edit visual</span>
      <button onClick={props.onToggle} className="grid size-8 place-items-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]" aria-label="Collapse chart inspector" data-testid="button-collapse-inspector"><ChevronRight size={15} /></button>
    </div>
    <Section title="Map the story" icon={<WandSparkles size={14} />}>
      <div className="space-y-3">
        <div><label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Hierarchy · drag order</label><div className="space-y-1.5">{props.levels.map((level, index) => <div key={`${level}-${index}`} className="flex items-center gap-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-2"><span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]">{index + 1}</span><select value={level} onChange={(event) => { const next = [...props.levels]; next[index] = event.target.value; props.setLevels(Array.from(new Set(next))); }} className="min-w-0 flex-1 bg-transparent text-xs outline-none" data-testid={`select-hierarchy-${index}`}>{props.columns.filter((column) => column !== props.valueColumn).map((column) => <option key={column} value={column}>{column}</option>)}</select><button onClick={() => move(index, -1)} disabled={index === 0} className="text-[hsl(var(--muted-foreground))] disabled:opacity-25" aria-label={`Move ${level} up`} data-testid={`button-move-level-up-${index}`}><ArrowUp size={13} /></button><button onClick={() => move(index, 1)} disabled={index === props.levels.length - 1} className="text-[hsl(var(--muted-foreground))] disabled:opacity-25" aria-label={`Move ${level} down`} data-testid={`button-move-level-down-${index}`}><ArrowDown size={13} /></button></div>)}</div></div>
        <div><label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Value</label><select value={props.valueColumn} onChange={(event) => props.setValueColumn(event.target.value)} className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-2.5 py-2 text-xs outline-none focus:border-[hsl(var(--primary))]" data-testid="select-value-column">{props.columns.map((column) => <option key={column} value={column}>{column}</option>)}</select></div>
        <label className="flex cursor-pointer items-center justify-between rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2.5 text-xs"><span>Reverse direction</span><input type="checkbox" checked={props.reverse} onChange={(event) => props.setReverse(event.target.checked)} className="accent-[hsl(var(--primary))]" data-testid="input-reverse-direction" /></label>
      </div>
    </Section>
    <Section title="Style" icon={<Palette size={14} />}>
      <div className="space-y-4">
        <div><label className="mb-2 block text-[10px] font-medium uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Palette</label><div className="flex gap-2">{(["signal", "mineral", "citrus"] as const).map((name) => <button key={name} onClick={() => props.setPalette(name)} className={`flex flex-1 items-center gap-1.5 rounded-md border px-2 py-2 text-[10px] capitalize ${props.palette === name ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]" : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"}`} data-testid={`button-palette-${name}`}><span className={`flex gap-0.5 ${name === "mineral" ? "text-[hsl(var(--chart-4))]" : name === "citrus" ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--primary))]"}`}><i className="size-2 rounded-full bg-current" /><i className="size-2 rounded-full bg-current opacity-60" /></span>{name}</button>)}</div></div>
        <div><label className="mb-2 block text-[10px] font-medium uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Canvas</label><div className="flex items-center gap-2"><input type="color" value={props.background} onChange={(event) => props.setBackground(event.target.value)} className="size-8 rounded border-0 bg-transparent p-0" aria-label="Canvas background color" data-testid="input-background-color" /><span className="font-mono text-[11px] text-[hsl(var(--muted-foreground))]">{props.background}</span><button onClick={() => props.setTransparent(!props.transparent)} className={`ml-auto flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] ${props.transparent ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}`} data-testid="button-toggle-transparent">{props.transparent ? <EyeOff size={12} /> : <Eye size={12} />} Transparent</button></div></div>
        <div><label className="mb-2 block text-[10px] font-medium uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Details</label><div className="grid grid-cols-2 gap-2"><label className="flex items-center gap-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-2 text-[11px]"><input type="checkbox" checked={props.showLabels} onChange={(event) => props.setShowLabels(event.target.checked)} className="accent-[hsl(var(--primary))]" data-testid="input-show-labels" /> Labels</label><select value={props.notation} onChange={(event) => props.setNotation(event.target.value as Props["notation"])} className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 text-[11px] outline-none" aria-label="Number formatting" data-testid="select-number-format"><option value="full">1,234</option><option value="compact">1.2K</option><option value="percent">Percent</option></select></div></div>
        <div className="space-y-2.5"><label className="block text-[10px] font-medium uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Band & node weight</label><label className="flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))]"><span className="w-16">Links</span><input type="range" min="0.12" max="0.5" step="0.01" value={props.linkOpacity} onChange={(event) => props.setLinkOpacity(Number(event.target.value))} className="min-w-0 flex-1 accent-[hsl(var(--primary))]" data-testid="input-link-opacity" /><span className="w-7 text-right font-mono">{Math.round(props.linkOpacity * 100)}%</span></label><label className="flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))]"><span className="w-16">Nodes</span><input type="range" min="8" max="24" step="1" value={props.nodeWidth} onChange={(event) => props.setNodeWidth(Number(event.target.value))} className="min-w-0 flex-1 accent-[hsl(var(--primary))]" data-testid="input-node-width" /><span className="w-7 text-right font-mono">{props.nodeWidth}px</span></label></div>
      </div>
    </Section>
    <Section title="Frame" icon={<SlidersHorizontal size={14} />} openDefault={false}>
      <div><label className="mb-2 block text-[10px] font-medium uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Aspect ratio</label><div className="grid grid-cols-3 gap-1.5">{["Auto", "16:9", "4:3", "1:1", "4:5", "9:16"].map((value) => <button key={value} onClick={() => props.setAspect(value)} className={`rounded-md border px-1.5 py-2 text-[10px] ${props.aspect === value ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.1)] font-semibold" : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]"}`} data-testid={`button-aspect-${value.replace(":", "-")}`}>{value}</button>)}</div></div>
    </Section>
  </aside>;
}