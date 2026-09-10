import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ClerkProvider, SignIn, SignUp, useUser } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { ErrorBoundary } from "@/components/error-boundary";
import { installGlobalErrorReporting } from "@/lib/errors";
import NotFound from "@/pages/not-found";
import ChartViewPage from "@/pages/chart-view";
import { PrivacyPage, TermsPage } from "@/pages/legal";
import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";
import { defaultTemplate, type Row } from "@/data/templates";
import { parseDelimited, type ImportSummary } from "@/lib/data";
import { createChartId, createGalleryItem, deleteGalleryItem as deleteGalleryItemRemote, fetchGallery, fetchGalleryItem, fetchMyGalleryItems, myGalleryVote, ownsGalleryItem, voteOnGalleryItem, type GalleryItem } from "@/lib/gallery";
import { buildSankeyModel } from "@/lib/sankey";
import { DataPreview } from "@/components/studio/DataPreview";
import { DatasetRail } from "@/components/studio/DatasetRail";
import { ExportMenu } from "@/components/studio/ExportMenu";
import { ImportPanel } from "@/components/studio/ImportPanel";
import { Inspector } from "@/components/studio/Inspector";
import { SankeyCanvas } from "@/components/studio/SankeyCanvas";
import { TopBar } from "@/components/studio/TopBar";

installGlobalErrorReporting();

type Palette = "signal" | "mineral" | "citrus";
type Notation = "full" | "compact" | "percent";

const configuredClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();
const clerkPubKey = configuredClerkKey
  ? publishableKeyFromHost(window.location.hostname, configuredClerkKey)
  : undefined;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string) {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(142 42% 47%)",
    colorForeground: "hsl(195 15% 18%)",
    colorMutedForeground: "hsl(195 9% 42%)",
    colorDanger: "hsl(4 65% 54%)",
    colorBackground: "hsl(42 32% 97%)",
    colorInput: "hsl(42 27% 94%)",
    colorInputForeground: "hsl(195 15% 18%)",
    colorNeutral: "hsl(38 20% 82%)",
    fontFamily: "DM Sans, sans-serif",
    borderRadius: "0.4rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#f8f5ed] rounded-xl w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "font-serif text-[#243033]",
    headerSubtitle: "text-[#6a7372]",
    socialButtonsBlockButtonText: "text-[#243033]",
    formFieldLabel: "text-[#243033]",
    footerActionLink: "text-[#3fa866]",
    footerActionText: "text-[#6a7372]",
    dividerText: "text-[#6a7372]",
    identityPreviewEditButton: "text-[#3fa866]",
    formFieldSuccessText: "text-[#2f8980]",
    alertText: "text-[#a94436]",
    logoBox: "h-9",
    logoImage: "max-h-9",
    socialButtonsBlockButton: "border-[#d9d0c2] bg-[#fbfaf7] hover:bg-[#f1ece2]",
    formButtonPrimary: "bg-[#3fa866] text-[#243033] hover:bg-[#358c55]",
    formFieldInput: "border-[#cfc4b4] bg-[#fbfaf7] text-[#243033]",
    footerAction: "bg-transparent",
    dividerLine: "bg-[#d9d0c2]",
    alert: "bg-[#fbebe7] border-[#e2aaa0]",
    otpCodeFieldInput: "border-[#cfc4b4] bg-[#fbfaf7] text-[#243033]",
    formFieldRow: "text-[#243033]",
    main: "bg-transparent",
  },
};

// Studio renders inside both the Clerk-enabled and plain (no ClerkProvider)
// trees, so it can't unconditionally call useUser() -- this is only mounted
// when authEnabled, reporting sign-in state up rather than being called directly.
function ClerkIdentityBridge({ onChange }: { onChange: (signedIn: boolean) => void }) {
  const { isSignedIn } = useUser();
  useEffect(() => { onChange(Boolean(isSignedIn)); }, [isSignedIn, onChange]);
  return null;
}

function Studio({ authEnabled }: { authEnabled: boolean }) {
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
  const [dataMenuOpen, setDataMenuOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [currentChartId, setCurrentChartId] = useState<string>();
  const [backgroundImage, setBackgroundImage] = useState<string>();
  const [nodeImageColumn, setNodeImageColumn] = useState("");
  const [nodeAssets, setNodeAssets] = useState<Record<string, string>>({});
  const [nodeOrder, setNodeOrder] = useState<Record<number, string[]>>({});
  const [galleryNotice, setGalleryNotice] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [myCharts, setMyCharts] = useState<GalleryItem[]>([]);
  const [myChartsLoading, setMyChartsLoading] = useState(false);
  const [isPrivateExport, setIsPrivateExport] = useState(false);
  const [, setLocation] = useLocation();

  const model = useMemo(() => buildSankeyModel(rows, levels, valueColumn, reverse, palette, nodeWidth, nodeImageColumn, nodeAssets, nodeOrder), [rows, levels, valueColumn, reverse, palette, nodeWidth, nodeImageColumn, nodeAssets, nodeOrder, layoutKey]);
  useEffect(() => {
    let active = true;
    fetchGallery().then((items) => { if (active) { setGallery(items); setGalleryLoading(false); } });
    const chartToLoad = new URLSearchParams(window.location.search).get("chart");
    if (chartToLoad) {
      const url = new URL(window.location.href);
      url.searchParams.delete("chart");
      window.history.replaceState({}, "", url);
      fetchGalleryItem(chartToLoad).then((item) => { if (active && item) loadGalleryItem(item); });
    }
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!signedIn) { setMyCharts([]); return; }
    let active = true;
    setMyChartsLoading(true);
    fetchMyGalleryItems().then((items) => { if (active) { setMyCharts(items); setMyChartsLoading(false); } });
    return () => { active = false; };
  }, [signedIn]);
  const loadGalleryItem = (item: GalleryItem) => {
    setRows(item.rows); setColumns(item.columns); setLevels(item.levels); setValueColumn(item.valueColumn); setReverse(item.reverse); setPalette(item.palette); setBackground(item.background); setTransparent(item.transparent); setShowLabels(item.showLabels); setNotation(item.notation); setLinkOpacity(item.linkOpacity); setNodeWidth(item.nodeWidth); setAspect(item.aspect); setBackgroundImage(item.backgroundImage); setNodeImageColumn(item.nodeImageColumn ?? ""); setNodeAssets(item.nodeAssets ?? {}); setNodeOrder(item.nodeOrder ?? {}); setTitle(item.title); setSubtitle(item.description); setSelectedId(null); setImportSummary(undefined); setImportError(""); setCurrentChartId(item.chartId); setGalleryNotice("");
  };
  const onImported = (summary: ImportSummary) => {
    setImportSummary(summary);
    if (!summary.rows.length) { setImportError(summary.errors[0] ?? "No usable rows were found."); return; }
    const detectedValue = summary.columns.find((column) => summary.rows.some((row) => typeof row[column] === "number" && Number.isFinite(Number(row[column])))) ?? summary.columns.at(-1) ?? "";
    const detectedLevels = summary.columns.filter((column) => column !== detectedValue).slice(0, 4);
    if (detectedLevels.length < 2) { setImportError("Map at least two text columns and one numeric value."); return; }
    setRows(summary.rows); setColumns(summary.columns); setLevels(detectedLevels); setValueColumn(detectedValue); setTitle(summary.fileName ? summary.fileName.replace(/\.[^/.]+$/, "") : "Untitled story"); setSubtitle("A local dataset, ready to shape."); setSelectedId(null); setImportError(""); setCurrentChartId(undefined); setBackgroundImage(undefined); setNodeImageColumn(""); setNodeAssets({}); setNodeOrder({}); setGalleryNotice("");
  };
  const handleSelect = (id: string | null) => setSelectedId(id);
  const frameStyle = aspect === "Auto" ? undefined : { aspectRatio: aspect.replace(":", " / ") };

  const openImport = (tab: "file" | "paste" = "file") => { setImportTab(tab); setImportOpen(true); };
  const openExport = () => { setCurrentChartId((id) => id ?? createChartId()); setExportOpen(true); };
  const saveExportToGallery = async (chartId: string) => {
    const item: Omit<GalleryItem, "createdAt" | "upvotes" | "downvotes"> = { chartId, title: title || "Untitled story", description: subtitle, columns, rows, levels, valueColumn, reverse, palette, background, transparent, showLabels, notation, linkOpacity, nodeWidth, aspect, backgroundImage, nodeImageColumn, nodeAssets, nodeOrder, isPrivate: signedIn && isPrivateExport };
    const result = await createGalleryItem(item);
    if (result.ok) {
      if (result.item.isPrivate) {
        setMyCharts((current) => [result.item, ...current.filter((existing) => existing.chartId !== chartId)]);
        setGalleryNotice(`Saved ${chartId} privately — only visible to you.`);
      } else {
        setGallery((current) => [result.item, ...current.filter((existing) => existing.chartId !== chartId)].slice(0, 40));
        if (signedIn) setMyCharts((current) => [result.item, ...current.filter((existing) => existing.chartId !== chartId)]);
        setGalleryNotice(`Saved ${chartId} to the shared gallery — visible to everyone.`);
      }
      setIsPrivateExport(false);
    } else if (result.reason === "too_large") {
      setGalleryNotice("The export completed, but this chart's images were too large to share (max 2MB).");
    } else {
      setGalleryNotice("The export completed, but it could not be added to the shared gallery. Check your connection and try again.");
    }
    setCurrentChartId(chartId);
  };
  const deleteGalleryItem = async (chartId: string) => {
    const removed = await deleteGalleryItemRemote(chartId);
    if (removed) {
      setGallery((current) => current.filter((item) => item.chartId !== chartId));
      setMyCharts((current) => current.filter((item) => item.chartId !== chartId));
    }
    if (currentChartId === chartId) setCurrentChartId(undefined);
  };
  const voteGalleryItem = async (chartId: string, vote: 1 | -1) => {
    const result = await voteOnGalleryItem(chartId, vote);
    if (result.ok) {
      const patch = (item: GalleryItem) => item.chartId === chartId ? { ...item, upvotes: result.upvotes, downvotes: result.downvotes } : item;
      setGallery((current) => current.map(patch));
      setMyCharts((current) => current.map(patch));
    }
  };
  return <div className="studio-noise flex min-h-[100dvh] flex-col bg-[hsl(var(--background))]">
    {authEnabled && <ClerkIdentityBridge onChange={setSignedIn} />}
     <TopBar authEnabled={authEnabled} onImport={() => openImport()} onExport={openExport} onHelp={() => setHelpOpen(true)} onMenu={() => setDataMenuOpen((open) => !open)} onInspector={() => setInspectorOpen((open) => !open)} onSignIn={() => setLocation("/sign-in")} onSignUp={() => setLocation("/sign-up")} dataOpen={dataMenuOpen} inspectorOpen={inspectorOpen} />
    <div className="flex flex-1 flex-col lg:flex-row">
      <div id="dataset-rail"><DatasetRail onImport={() => openImport()} onPaste={() => openImport("paste")} collapsed={!dataMenuOpen} onToggle={() => setDataMenuOpen((open) => !open)} gallery={gallery} galleryLoading={galleryLoading} activeGalleryId={currentChartId} onSelectGallery={loadGalleryItem} onDeleteGallery={deleteGalleryItem} canDeleteGallery={ownsGalleryItem} onVoteGallery={voteGalleryItem} myGalleryVote={myGalleryVote} signedIn={signedIn} myCharts={myCharts} myChartsLoading={myChartsLoading} /></div>
      <main className="min-w-0 flex-1 px-4 py-5 sm:px-7 sm:py-7">
        <div className="mx-auto max-w-[1160px]">
          <div className="fade-up mb-5 flex flex-wrap items-end justify-between gap-4">
            <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">A visual instrument for messy tables</p><h2 className="mt-1 max-w-[600px] font-serif text-[clamp(2rem,4.2vw,3.65rem)] leading-[.95] tracking-[-.04em]">Make the movement <em>visible.</em></h2></div>
            <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--muted-foreground))]"><span className="font-mono text-[10px]">{rows.length} rows</span><span className="size-1 rounded-full bg-[hsl(var(--border))]" /><span className="font-mono text-[10px]">{model.links.length} flows</span></div>
          </div>
          <div className={`mt-5${aspect === "Auto" ? "" : " flex"}`} style={frameStyle}><SankeyCanvas model={model} title={title || "Untitled story"} subtitle={subtitle} background={background} backgroundImage={backgroundImage} transparent={transparent} showLabels={showLabels} notation={notation} linkOpacity={linkOpacity} selectedId={selectedId} onSelect={handleSelect} onResetLayout={() => { setSelectedId(null); setNodeOrder({}); setLayoutKey((key) => key + 1); }} onReorderNode={(level, orderedIds) => setNodeOrder((current) => ({ ...current, [level]: orderedIds }))} /></div>
          <p className="mt-3 text-[10px] leading-relaxed text-[hsl(var(--muted-foreground))]"><span className="font-semibold text-[hsl(var(--foreground)/.75)]">Reading this:</span> band width is proportional to value. Select a band or node for a precise readout. Every calculation stays on this device.</p>
          {galleryNotice && <div className="mt-3 rounded-md border border-[hsl(var(--accent)/.45)] bg-[hsl(var(--accent)/.12)] px-3 py-2 text-xs text-[hsl(var(--foreground))]" role="status" data-testid="status-gallery-notice">{galleryNotice}</div>}
          <div className="mt-5"><DataPreview rows={rows} columns={columns} levels={levels} valueColumn={valueColumn} summary={importSummary} onImport={() => openImport()} /></div>
          {importError && <div className="mt-3 flex items-center justify-between rounded-md border border-[hsl(var(--destructive)/.35)] bg-[hsl(var(--destructive)/.07)] px-3 py-2 text-xs text-[hsl(var(--destructive))]" role="alert" data-testid="status-validation-error"><span>{importError}</span><button onClick={() => setImportError("")} className="text-[10px] font-semibold hover:underline" data-testid="button-dismiss-validation">Dismiss</button></div>}
          <div className="mt-5 grid gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card)/.45)] p-3 sm:grid-cols-[minmax(160px,1fr)_minmax(200px,1.7fr)]">
            <div><label htmlFor="chart-title" className="mb-1 block text-[10px] font-medium uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Title</label><input id="chart-title" value={title} onChange={(event) => setTitle(event.target.value)} className="w-full border-0 bg-transparent px-0 text-sm font-semibold outline-none placeholder:text-[hsl(var(--muted-foreground))]" data-testid="input-chart-title" /></div>
            <div><label htmlFor="chart-subtitle" className="mb-1 block text-[10px] font-medium uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Subtitle / source note</label><input id="chart-subtitle" value={subtitle} onChange={(event) => setSubtitle(event.target.value)} className="w-full border-0 bg-transparent px-0 text-xs text-[hsl(var(--muted-foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]" data-testid="input-chart-subtitle" /></div>
          </div>
          <div className="mt-8 flex gap-3 text-[10px] text-[hsl(var(--muted-foreground)/.7)]"><button onClick={() => setLocation("/privacy")} className="hover:underline" data-testid="link-privacy">Privacy</button><span>·</span><button onClick={() => setLocation("/terms")} className="hover:underline" data-testid="link-terms">Terms</button></div>
        </div>
      </main>
      <Inspector columns={columns} levels={levels} valueColumn={valueColumn} reverse={reverse} setLevels={setLevels} setValueColumn={setValueColumn} setReverse={setReverse} palette={palette} setPalette={setPalette} background={background} setBackground={setBackground} backgroundImage={backgroundImage} setBackgroundImage={setBackgroundImage} transparent={transparent} setTransparent={setTransparent} showLabels={showLabels} setShowLabels={setShowLabels} notation={notation} setNotation={setNotation} imageColumns={columns.filter((column) => column !== valueColumn)} imageColumn={nodeImageColumn} setImageColumn={setNodeImageColumn} nodes={model.nodes.map(({ id, label, level }) => ({ id, label, level }))} nodeAssets={nodeAssets} setNodeAsset={(id, image) => setNodeAssets((assets) => ({ ...assets, [id]: image }))} clearNodeAsset={(id) => setNodeAssets((assets) => { const next = { ...assets }; delete next[id]; return next; })} linkOpacity={linkOpacity} setLinkOpacity={setLinkOpacity} nodeWidth={nodeWidth} setNodeWidth={setNodeWidth} aspect={aspect} setAspect={setAspect} collapsed={!inspectorOpen} onToggle={() => setInspectorOpen((open) => !open)} />
    </div>
    {importOpen && <ImportPanel initialTab={importTab} onImported={(summary) => { onImported(summary); setImportOpen(false); }} onClose={() => setImportOpen(false)} />}
    {exportOpen && currentChartId && <ExportMenu model={model} chartId={currentChartId} title={title || "Untitled story"} subtitle={subtitle} background={background} backgroundImage={backgroundImage} transparent={transparent} showLabels={showLabels} notation={notation} signedIn={signedIn} isPrivate={isPrivateExport} onPrivateChange={setIsPrivateExport} onClose={() => setExportOpen(false)} onSaved={saveExportToGallery} />}
    {helpOpen && <div className="fixed inset-0 z-40 grid place-items-center bg-[hsl(var(--foreground)/.28)] p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="help-title"><div className="fade-up w-full max-w-[440px] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">Quick guide</p><h2 id="help-title" className="mt-1 font-serif text-2xl">A few good moves</h2></div><button onClick={() => setHelpOpen(false)} className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]" data-testid="button-close-help">Close</button></div><ol className="mt-5 space-y-3 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]"><li><b className="mr-2 font-mono text-[hsl(var(--primary))]">01</b>Pick an example question, or import a table from your device.</li><li><b className="mr-2 font-mono text-[hsl(var(--primary))]">02</b>Use Map the story to choose the order of your levels and the value column.</li><li><b className="mr-2 font-mono text-[hsl(var(--primary))]">03</b>Click any node or flow to isolate its story, then export a PNG or editable SVG.</li></ol><button onClick={() => setHelpOpen(false)} className="mt-6 w-full rounded-md bg-[hsl(var(--primary))] py-2.5 text-xs font-semibold text-[hsl(var(--primary-foreground))]" data-testid="button-start-exploring">Start exploring</button></div></div>}
  </div>;
}

function SignInPage() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-[hsl(var(--background))] px-4"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></div>;
}

function SignUpPage() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-[hsl(var(--background))] px-4"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></div>;
}

function Router({ authEnabled }: { authEnabled: boolean }) {
  return <Switch><Route path="/" component={() => <Studio authEnabled={authEnabled} />} /><Route path="/chart/:chartId" component={ChartViewPage} /><Route path="/privacy" component={PrivacyPage} /><Route path="/terms" component={TermsPage} />{authEnabled && <><Route path="/sign-in/*?" component={SignInPage} /><Route path="/sign-up/*?" component={SignUpPage} /></>}<Route component={NotFound} /></Switch>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  const ClerkApp = () => {
    const [, setLocation] = useLocation();
    return <ClerkProvider publishableKey={clerkPubKey!} proxyUrl={clerkProxyUrl} appearance={clerkAppearance} signInUrl={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} localization={{ signIn: { start: { title: "Welcome back", subtitle: "Sign in to continue your visual work." } }, signUp: { start: { title: "Create your account", subtitle: "Save your visual work for later." } } }} routerPush={(to) => setLocation(stripBase(to))} routerReplace={(to) => setLocation(stripBase(to), { replace: true })}><RoutedErrorBoundary><Router authEnabled /></RoutedErrorBoundary></ClerkProvider>;
  };
  const PublicApp = () => <RoutedErrorBoundary><Router authEnabled={false} /></RoutedErrorBoundary>;
  return <WouterRouter base={basePath}>{clerkPubKey ? <ClerkApp /> : <PublicApp />}</WouterRouter>;
}

export default App;