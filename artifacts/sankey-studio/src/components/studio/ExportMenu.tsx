import { Check, Download, FileImage, FileOutput, Film, GalleryHorizontalEnd, X } from "lucide-react";
import { useState } from "react";
import type { SankeyModel } from "@/lib/sankey";
import { exportGif, exportPng, exportSvg, type SankeyExportOptions } from "@/lib/export";

type Props = { model: SankeyModel; chartId: string; title: string; subtitle: string; background: string; backgroundImage?: string; transparent: boolean; showLabels: boolean; notation: "full" | "compact" | "percent"; onClose: () => void; onSaved: (chartId: string) => void };
type GifSettings = { revealDurationMs: number; introHoldMs: number; outroHoldMs: number; width: number; height: number };
type GifFramePreset = "1920x1080" | "1280x720" | "1080x1080" | "1080x1350" | "1080x1920" | "custom";

const gifFramePresets: Array<{ value: GifFramePreset; label: string; width?: number; height?: number }> = [
  { value: "1920x1080", label: "Full HD · 1920 × 1080", width: 1920, height: 1080 },
  { value: "1280x720", label: "HD · 1280 × 720", width: 1280, height: 720 },
  { value: "1080x1080", label: "Square · 1080 × 1080", width: 1080, height: 1080 },
  { value: "1080x1350", label: "Portrait · 1080 × 1350", width: 1080, height: 1350 },
  { value: "1080x1920", label: "Vertical · 1080 × 1920", width: 1080, height: 1920 },
  { value: "custom", label: "Custom frame size" },
];

const formatSeconds = (milliseconds: number) => `${(milliseconds / 1000).toFixed(milliseconds % 1000 === 0 ? 0 : 1)}s`;

export function ExportMenu({ model, chartId, title, subtitle, background, backgroundImage, transparent, showLabels, notation, onClose, onSaved }: Props) {
  const [done, setDone] = useState("");
  const [gifProgress, setGifProgress] = useState<number | null>(null);
  const [gifFramePreset, setGifFramePreset] = useState<GifFramePreset>("1920x1080");
  const [gifSettings, setGifSettings] = useState<GifSettings>({ revealDurationMs: 1800, introHoldMs: 1000, outroHoldMs: 1200, width: 1920, height: 1080 });
  const options: SankeyExportOptions = { title, subtitle, background, backgroundImage, transparent, showLabels, notation, chartId };
  const png = async (scale: number, isTransparent = false) => { try { await exportPng(model, { ...options, transparent: isTransparent || transparent }, scale, `sankey-${chartId}-${scale === 2 ? "2x-" : ""}${isTransparent ? "transparent-" : ""}export.png`); onSaved(chartId); setDone(`${scale === 2 ? "2× PNG saved" : isTransparent ? "Transparent PNG saved" : "PNG saved"} · ${chartId}`); } catch { setDone("PNG export could not embed an image. Try a local image or export SVG."); } };
  const gif = async () => {
    if (gifProgress !== null) return;
    setDone("");
    setGifProgress(0);
    try {
      await exportGif(model, options, { ...gifSettings, onProgress: setGifProgress }, `sankey-${chartId}-${gifSettings.width}x${gifSettings.height}-animated.gif`);
      onSaved(chartId);
      setDone(`Animated GIF saved · ${chartId}`);
    } catch {
      setDone("GIF export could not render. Try removing remote images or exporting SVG.");
    } finally {
      setGifProgress(null);
    }
  };
  const updateGifSetting = (key: keyof GifSettings, value: number) => setGifSettings((current) => ({ ...current, [key]: value }));
  const updateGifFramePreset = (value: GifFramePreset) => {
    setGifFramePreset(value);
    const preset = gifFramePresets.find((option) => option.value === value);
    if (preset?.width && preset.height) setGifSettings((current) => ({ ...current, width: preset.width!, height: preset.height! }));
  };
  return <div className="fixed inset-0 z-40 grid place-items-center bg-[hsl(var(--foreground)/.28)] p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="export-title">
    <div className="fade-up max-h-[calc(100dvh-2rem)] w-full max-w-[430px] overflow-y-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl">
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-4"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">Output</p><h2 id="export-title" className="mt-1 font-serif text-2xl">Take it with you</h2></div><button onClick={onClose} className="grid size-8 place-items-center rounded-md text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]" aria-label="Close export menu" data-testid="button-close-export"><X size={16} /></button></div>
      <div className="space-y-3 p-5">
        <div className="mb-1 flex items-center gap-2 rounded-md bg-[hsl(var(--secondary)/.55)] px-3 py-2 text-[10px] text-[hsl(var(--muted-foreground))]"><GalleryHorizontalEnd size={13} className="text-[hsl(var(--primary))]" /><span>Export ID <strong className="font-mono text-[hsl(var(--foreground))]">{chartId}</strong> · saved to gallery after export</span></div>
        {(backgroundImage || model.nodes.some((node) => node.image)) && <p className="rounded-md border border-[hsl(var(--border))] px-3 py-2 text-[10px] leading-relaxed text-[hsl(var(--muted-foreground))]">Local images are embedded in exports. PNG and GIF may reject remote image URLs without CORS permission; SVG keeps the original image reference.</p>}
        {transparent && <p className="rounded-md border border-[hsl(var(--border))] px-3 py-2 text-[10px] leading-relaxed text-[hsl(var(--muted-foreground))]">GIF frames use the selected canvas color; transparent backgrounds are preserved by the transparent PNG export instead.</p>}
        <section className="rounded-lg border border-[hsl(var(--primary)/.35)] bg-[hsl(var(--primary)/.04)] p-3.5" aria-labelledby="gif-export-heading">
          <div className="flex items-start gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-md bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]"><Film size={16} /></span><div><h3 id="gif-export-heading" className="text-xs font-semibold">Animated GIF</h3><p className="mt-0.5 text-[10px] leading-relaxed text-[hsl(var(--muted-foreground))]">Reveal the flows once, then hold the finished chart. Everything is rendered in this browser.</p></div></div>
          <div className="mt-4 space-y-3">
             <label className="block"><span className="flex items-center justify-between text-[10px] font-medium"><span>Frame size</span><span className="font-mono text-[hsl(var(--primary))]">{gifSettings.width} × {gifSettings.height}</span></span><select value={gifFramePreset} onChange={(event) => updateGifFramePreset(event.target.value as GifFramePreset)} className="mt-2 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-2 text-[11px] outline-none focus:border-[hsl(var(--primary))]" aria-label="GIF frame size" data-testid="select-gif-frame-size">{gifFramePresets.map((preset) => <option key={preset.value} value={preset.value}>{preset.label}</option>)}</select><span className="mt-1 block text-[9px] text-[hsl(var(--muted-foreground))]">The full Sankey stays visible inside the frame without cropping.</span></label>
             {gifFramePreset === "custom" && <div className="grid grid-cols-2 gap-3"><label className="block"><span className="text-[10px] font-medium">Width</span><input type="number" min="320" max="4096" step="1" value={gifSettings.width} onChange={(event) => updateGifSetting("width", Math.min(4096, Math.max(320, Number(event.target.value) || 320)))} className="mt-1 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-2 text-[11px] outline-none focus:border-[hsl(var(--primary))]" aria-label="GIF frame width" data-testid="input-gif-frame-width" /></label><label className="block"><span className="text-[10px] font-medium">Height</span><input type="number" min="320" max="4096" step="1" value={gifSettings.height} onChange={(event) => updateGifSetting("height", Math.min(4096, Math.max(320, Number(event.target.value) || 320)))} className="mt-1 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-2 text-[11px] outline-none focus:border-[hsl(var(--primary))]" aria-label="GIF frame height" data-testid="input-gif-frame-height" /></label></div>}
            <label className="block"><span className="flex items-center justify-between text-[10px] font-medium"><span>Animation speed <span className="font-normal text-[hsl(var(--muted-foreground))]">· reveal duration</span></span><span className="font-mono text-[hsl(var(--primary))]">{formatSeconds(gifSettings.revealDurationMs)}</span></span><input type="range" min="600" max="4000" step="100" value={gifSettings.revealDurationMs} onChange={(event) => updateGifSetting("revealDurationMs", Number(event.target.value))} className="mt-2 w-full accent-[hsl(var(--primary))]" aria-label="GIF animation speed" data-testid="input-gif-reveal-duration" /><span className="mt-1 block text-[9px] text-[hsl(var(--muted-foreground))]">Shorter is faster.</span></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="flex items-center justify-between text-[10px] font-medium"><span>Start screen</span><span className="font-mono text-[hsl(var(--primary))]">{formatSeconds(gifSettings.introHoldMs)}</span></span><input type="range" min="0" max="4000" step="500" value={gifSettings.introHoldMs} onChange={(event) => updateGifSetting("introHoldMs", Number(event.target.value))} className="mt-2 w-full accent-[hsl(var(--primary))]" aria-label="GIF start screen duration" data-testid="input-gif-intro-duration" /></label>
              <label className="block"><span className="flex items-center justify-between text-[10px] font-medium"><span>End screen</span><span className="font-mono text-[hsl(var(--primary))]">{formatSeconds(gifSettings.outroHoldMs)}</span></span><input type="range" min="0" max="4000" step="500" value={gifSettings.outroHoldMs} onChange={(event) => updateGifSetting("outroHoldMs", Number(event.target.value))} className="mt-2 w-full accent-[hsl(var(--primary))]" aria-label="GIF end screen duration" data-testid="input-gif-outro-duration" /></label>
            </div>
          </div>
          <button onClick={() => void gif()} disabled={gifProgress !== null} className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[hsl(var(--primary))] px-3 py-2.5 text-xs font-semibold text-[hsl(var(--primary-foreground))] transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60" data-testid="button-export-gif"><Film size={14} />{gifProgress === null ? "Save animated GIF" : `Rendering GIF · ${Math.round(gifProgress * 100)}%`}</button>
        </section>
        <button onClick={() => void png(1)} className="flex w-full items-center gap-3 rounded-lg border border-[hsl(var(--border))] px-3.5 py-3 text-left transition hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--muted)/.5)]" data-testid="button-export-png"><span className="grid size-8 place-items-center rounded-md bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><FileImage size={16} /></span><span><span className="block text-xs font-semibold">PNG <span className="font-normal text-[hsl(var(--muted-foreground))]">· current size</span></span><span className="mt-0.5 block text-[10px] text-[hsl(var(--muted-foreground))]">Ready for slides and docs</span></span></button>
        <button onClick={() => void png(2)} className="flex w-full items-center gap-3 rounded-lg border border-[hsl(var(--border))] px-3.5 py-3 text-left transition hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--muted)/.5)]" data-testid="button-export-png-2x"><span className="grid size-8 place-items-center rounded-md bg-[hsl(var(--accent)/.34)] text-[hsl(var(--foreground))]"><Download size={16} /></span><span><span className="block text-xs font-semibold">PNG <span className="font-normal text-[hsl(var(--muted-foreground))]">· 2× resolution</span></span><span className="mt-0.5 block text-[10px] text-[hsl(var(--muted-foreground))]">Crisp enough for a large room</span></span></button>
        <button onClick={() => void png(2, true)} className="flex w-full items-center gap-3 rounded-lg border border-[hsl(var(--border))] px-3.5 py-3 text-left transition hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--muted)/.5)]" data-testid="button-export-png-transparent"><span className="grid size-8 place-items-center rounded-md bg-[repeating-conic-gradient(hsl(var(--muted))_0_25%,hsl(var(--card))_0_50%)_50%/12px_12px] text-[hsl(var(--foreground))]"><Check size={16} /></span><span><span className="block text-xs font-semibold">PNG <span className="font-normal text-[hsl(var(--muted-foreground))]">· transparent</span></span><span className="mt-0.5 block text-[10px] text-[hsl(var(--muted-foreground))]">Place it on any background</span></span></button>
        <button onClick={() => { try { exportSvg(model, options, `sankey-${chartId}-export.svg`); onSaved(chartId); setDone(`SVG saved · ${chartId}`); } catch { setDone("SVG export could not be created."); } }} className="flex w-full items-center gap-3 rounded-lg border border-[hsl(var(--border))] px-3.5 py-3 text-left transition hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--muted)/.5)]" data-testid="button-export-svg"><span className="grid size-8 place-items-center rounded-md bg-[hsl(var(--secondary))] text-[hsl(var(--chart-2))]"><FileOutput size={16} /></span><span><span className="block text-xs font-semibold">SVG <span className="font-normal text-[hsl(var(--muted-foreground))]">· editable vector</span></span><span className="mt-0.5 block text-[10px] text-[hsl(var(--muted-foreground))]">Best for Illustrator and Figma</span></span></button>
      </div>
      {done && <div className="mx-5 mb-5 rounded-md bg-[hsl(var(--secondary))] px-3 py-2 text-center text-[11px] font-medium text-[hsl(var(--chart-2))]" data-testid="status-export-complete">{done}</div>}
    </div>
  </div>;
}