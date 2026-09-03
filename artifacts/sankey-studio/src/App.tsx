import { useMemo, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";
import { datasetTemplates, defaultTemplate, type DatasetTemplate, type Row } from "@/data/templates";
import { parseDelimited, type ImportSummary } from "@/lib/data";
import { createChartId, readGallery, upsertGalleryItem, writeGallery, type GalleryItem } from "@/lib/gallery";
import { buildSankeyModel } from "@/lib/sankey";
import { DataPreview } from "@/components/studio/DataPreview";
import { DatasetRail } from "@/components/studio/DatasetRail";
import { ExportMenu } from "@/components/studio/ExportMenu";
import { ImportPanel } from "@/components/studio/ImportPanel";
import { Inspector } from "@/components/studio/Inspector";
import { SankeyCanvas } from "@/components/studio/SankeyCanvas";
import { TopBar } from "@/components/studio/TopBar";

const queryClient = new QueryClient();
type Palette = "signal" | "mineral" | "citrus";
type Notation = "full" | "compact" | "percent";

function Studio() {
  const [template, setTemplate] = useState<DatasetTemplate>(defaultTemplate);
  const [rows, setRows] = useState<Row[]>(defaultTemplate.rows);
  const [columns, setColumns] = useState(defaultTemplate.columns);
  const [levels, setLevels] = useState(defaultTemplate.levels);
  const [valueColumn, setValueColumn] = useState("Value");
  const [reverse, setReverse] = useState(false);
  const [palette, setPalette] = useState<Palette>("signal");
  const [background, setBackground] = useState("#f8f5ed");
  const [transparent, setTransparent] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [notation, setNotation] = useState<Notation>("full");
  const [linkOpacity, setLinkOpacity] = useState(0.28);
  const [nodeWidth, setNodeWidth] = useState(14);
  const [aspect, setAspect] = useState("Auto");
  const [title, setTitle] = useState(defaultTemplate.title);
  const [subtitle, setSubtitle] = useState(defaultTemplate.description);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [importTab, setImportTab] = useState<"file" | "paste">("file");
  const [importSummary, setImportSummary] = useState<ImportSummary>();
  const [importError, setImportError] = useState("");
  const [layoutKey, setLayoutKey] = useState(0);
  const [dataMenuOpen, setDataMenuOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [gallery, setGallery] = useState<GalleryItem[]>(() => readGallery());
  const [currentChartId, setCurrentChartId] = useState<string>();

  const model = useMemo(() => buildSankeyModel(rows, levels, valueColumn, reverse, palette, nodeWidth), [rows, levels, valueColumn, reverse, palette, nodeWidth, layoutKey]);
  const loadTemplate = (next: DatasetTemplate) => {
    setTemplate(next); setRows(next.rows); setColumns(next.columns); setLevels(next.levels); setValueColumn("Value"); setTitle(next.title); setSubtitle(next.description); setSelectedId(null); setImportSummary(undefined); setImportError(""); setCurrentChartId(undefined);
  };
  const loadGalleryItem = (item: GalleryItem) => {
    setTemplate({ id: `gallery-${item.chartId}`, title: item.title, eyebrow: "Saved gallery", description: item.description, columns: item.columns, rows: item.rows, levels: item.levels });
    setRows(item.rows); setColumns(item.columns); setLevels(item.levels); setValueColumn(item.valueColumn); setReverse(item.reverse); setPalette(item.palette); setBackground(item.background); setTransparent(item.transparent); setShowLabels(item.showLabels); setNotation(item.notation); setLinkOpacity(item.linkOpacity); setNodeWidth(item.nodeWidth); setAspect(item.aspect); setTitle(item.title); setSubtitle(item.description); setSelectedId(null); setImportSummary(undefined); setImportError(""); setCurrentChartId(item.chartId);
  };
  const reset = () => loadTemplate(defaultTemplate);
  const onImported = (summary: ImportSummary) => {
    setImportSummary(summary);
    if (!summary.rows.length) { setImportError(summary.errors[0] ?? "No usable rows were found."); return; }
    const detectedValue = summary.columns.find((column) => summary.rows.some((row) => typeof row[column] === "number" && Number.isFinite(Number(row[column])))) ?? summary.columns.at(-1) ?? "";
    const detectedLevels = summary.columns.filter((column) => column !== detectedValue).slice(0, 4);
    if (detectedLevels.length < 2) { setImportError("Map at least two text columns and one numeric value."); return; }
    setTemplate({ ...defaultTemplate, id: "custom", title: summary.fileName ? summary.fileName.replace(/\.[^/.]+$/, "") : "Untitled story", eyebrow: "Imported locally", description: "A local dataset, ready to shape.", columns: summary.columns, rows: summary.rows, levels: detectedLevels });
    setRows(summary.rows); setColumns(summary.columns); setLevels(detectedLevels); setValueColumn(detectedValue); setTitle(summary.fileName ? summary.fileName.replace(/\.[^/.]+$/, "") : "Untitled story"); setSubtitle("A local dataset, ready to shape."); setSelectedId(null); setImportError(""); setCurrentChartId(undefined);
  };
  const handleSelect = (id: string | null) => setSelectedId(id);
  const frameStyle = aspect === "Auto" ? undefined : { aspectRatio: aspect.replace(":", " / ") };

  const openImport = (tab: "file" | "paste" = "file") => { setImportTab(tab); setImportOpen(true); };
  const openExport = () => { setCurrentChartId((id) => id ?? createChartId()); setExportOpen(true); };
  const saveExportToGallery = (chartId: string) => {
    const item: GalleryItem = { chartId, title: title || "Untitled story", description: subtitle, columns, rows, levels, valueColumn, reverse, palette, background, transparent, showLabels, notation, linkOpacity, nodeWidth, aspect, createdAt: new Date().toISOString() };
    setGallery((items) => { const next = upsertGalleryItem(items, item); writeGallery(next); return next; });
    setCurrentChartId(chartId);
  };
  const deleteGalleryItem = (chartId: string) => {
    setGallery((items) => { const next = items.filter((item) => item.chartId !== chartId); writeGallery(next); return next; });
    if (currentChartId === chartId) setCurrentChartId(undefined);
  };
  return <div className="studio-noise flex min-h-[100dvh] flex-col bg-[hsl(var(--background))]">
    <TopBar onImport={() => openImport()} onExport={openExport} onHelp={() => setHelpOpen(true)} onMenu={() => setDataMenuOpen((open) => !open)} onInspector={() => setInspectorOpen((open) => !open)} dataOpen={dataMenuOpen} inspectorOpen={inspectorOpen} />
    <div className="flex flex-1 flex-col lg:flex-row">
      <div id="dataset-rail"><DatasetRail templates={datasetTemplates} activeId={template.id} onSelect={loadTemplate} onImport={() => openImport()} onPaste={() => openImport("paste")} onReset={reset} collapsed={!dataMenuOpen} onToggle={() => setDataMenuOpen((open) => !open)} gallery={gallery} activeGalleryId={currentChartId} onSelectGallery={loadGalleryItem} onDeleteGallery={deleteGalleryItem} /></div>
      <main className="min-w-0 flex-1 px-4 py-5 sm:px-7 sm:py-7">
        <div className="mx-auto max-w-[1160px]">
          <div className="fade-up mb-5 flex flex-wrap items-end justify-between gap-4">
            <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">A visual instrument for messy tables</p><h2 className="mt-1 max-w-[600px] font-serif text-[clamp(2rem,4.2vw,3.65rem)] leading-[.95] tracking-[-.04em]">Make the movement <em>visible.</em></h2></div>
            <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--muted-foreground))]"><span className="font-mono text-[10px]">{rows.length} rows</span><span className="size-1 rounded-full bg-[hsl(var(--border))]" /><span className="font-mono text-[10px]">{model.links.length} flows</span></div>
          </div>
          <div className="mt-5" style={frameStyle}><SankeyCanvas model={model} title={title || "Untitled story"} subtitle={subtitle} background={background} transparent={transparent} showLabels={showLabels} notation={notation} linkOpacity={linkOpacity} selectedId={selectedId} onSelect={handleSelect} onResetLayout={() => { setSelectedId(null); setLayoutKey((key) => key + 1); }} /></div>
          <p className="mt-3 text-[10px] leading-relaxed text-[hsl(var(--muted-foreground))]"><span className="font-semibold text-[hsl(var(--foreground)/.75)]">Reading this:</span> band width is proportional to value. Select a band or node for a precise readout. Every calculation stays on this device.</p>
          <div className="mt-5"><DataPreview rows={rows} columns={columns} summary={importSummary} onImport={() => openImport()} /></div>
          {importError && <div className="mt-3 flex items-center justify-between rounded-md border border-[hsl(var(--destructive)/.35)] bg-[hsl(var(--destructive)/.07)] px-3 py-2 text-xs text-[hsl(var(--destructive))]" role="alert" data-testid="status-validation-error"><span>{importError}</span><button onClick={() => setImportError("")} className="text-[10px] font-semibold hover:underline" data-testid="button-dismiss-validation">Dismiss</button></div>}
          <div className="mt-5 grid gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card)/.45)] p-3 sm:grid-cols-[minmax(160px,1fr)_minmax(200px,1.7fr)]">
            <div><label htmlFor="chart-title" className="mb-1 block text-[10px] font-medium uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Title</label><input id="chart-title" value={title} onChange={(event) => setTitle(event.target.value)} className="w-full border-0 bg-transparent px-0 text-sm font-semibold outline-none placeholder:text-[hsl(var(--muted-foreground))]" data-testid="input-chart-title" /></div>
            <div><label htmlFor="chart-subtitle" className="mb-1 block text-[10px] font-medium uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Subtitle / source note</label><input id="chart-subtitle" value={subtitle} onChange={(event) => setSubtitle(event.target.value)} className="w-full border-0 bg-transparent px-0 text-xs text-[hsl(var(--muted-foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]" data-testid="input-chart-subtitle" /></div>
          </div>
        </div>
      </main>
      <Inspector columns={columns} levels={levels} valueColumn={valueColumn} reverse={reverse} setLevels={setLevels} setValueColumn={setValueColumn} setReverse={setReverse} palette={palette} setPalette={setPalette} background={background} setBackground={setBackground} transparent={transparent} setTransparent={setTransparent} showLabels={showLabels} setShowLabels={setShowLabels} notation={notation} setNotation={setNotation} linkOpacity={linkOpacity} setLinkOpacity={setLinkOpacity} nodeWidth={nodeWidth} setNodeWidth={setNodeWidth} aspect={aspect} setAspect={setAspect} collapsed={!inspectorOpen} onToggle={() => setInspectorOpen((open) => !open)} />
    </div>
    {importOpen && <ImportPanel initialTab={importTab} onImported={(summary) => { onImported(summary); setImportOpen(false); }} onClose={() => setImportOpen(false)} />}
    {exportOpen && currentChartId && <ExportMenu model={model} chartId={currentChartId} title={title || "Untitled story"} subtitle={subtitle} background={background} transparent={transparent} showLabels={showLabels} notation={notation} onClose={() => setExportOpen(false)} onSaved={saveExportToGallery} />}
    {helpOpen && <div className="fixed inset-0 z-40 grid place-items-center bg-[hsl(var(--foreground)/.28)] p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="help-title"><div className="fade-up w-full max-w-[440px] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">Quick guide</p><h2 id="help-title" className="mt-1 font-serif text-2xl">A few good moves</h2></div><button onClick={() => setHelpOpen(false)} className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]" data-testid="button-close-help">Close</button></div><ol className="mt-5 space-y-3 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]"><li><b className="mr-2 font-mono text-[hsl(var(--primary))]">01</b>Pick an example question, or import a table from your device.</li><li><b className="mr-2 font-mono text-[hsl(var(--primary))]">02</b>Use Map the story to choose the order of your levels and the value column.</li><li><b className="mr-2 font-mono text-[hsl(var(--primary))]">03</b>Click any node or flow to isolate its story, then export a PNG or editable SVG.</li></ol><button onClick={() => setHelpOpen(false)} className="mt-6 w-full rounded-md bg-[hsl(var(--primary))] py-2.5 text-xs font-semibold text-[hsl(var(--primary-foreground))]" data-testid="button-start-exploring">Start exploring</button></div></div>}
  </div>;
}

function Router() {
  return <Switch><Route path="/" component={Studio} /><Route component={NotFound} /></Switch>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}><RoutedErrorBoundary><Router /></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;