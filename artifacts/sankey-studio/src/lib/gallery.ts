import type { Row } from "@/data/templates";
import { supabase } from "@/lib/supabase";
import { buildSankeyModel } from "@/lib/sankey";
import { modelToSvg } from "@/lib/export";

const GALLERY_SVG_BUCKET = "gallery-svg";

export function galleryEmbedUrl(chartId: string): string {
  return supabase.storage.from(GALLERY_SVG_BUCKET).getPublicUrl(`${chartId}.svg`).data.publicUrl;
}

// A one-time snapshot taken when a chart is first shared, not regenerated on
// every view: embeds should show what was published, not silently change if
// the source chart is later edited, and -- more importantly -- this is what
// lets an embed be served straight from Storage's CDN with zero database or
// app load per view, however popular the page embedding it gets.
async function uploadGallerySnapshot(item: Omit<GalleryItem, "createdAt" | "upvotes" | "downvotes">) {
  try {
    const model = buildSankeyModel(item.rows, item.levels, item.valueColumn, item.reverse, item.palette, item.nodeWidth, item.nodeImageColumn, item.nodeAssets, item.nodeOrder);
    const svg = modelToSvg(model, { title: item.title, subtitle: item.description, background: item.background, transparent: item.transparent, showLabels: item.showLabels, notation: item.notation, backgroundImage: item.backgroundImage, chartId: item.chartId });
    await supabase.storage.from(GALLERY_SVG_BUCKET).upload(`${item.chartId}.svg`, new Blob([svg], { type: "image/svg+xml" }), { contentType: "image/svg+xml", upsert: false });
  } catch {
    // Non-critical: the chart is already saved and shareable via the interactive
    // permalink page even if this static snapshot fails to upload.
  }
}

export type GalleryItem = {
  chartId: string;
  title: string;
  description: string;
  columns: string[];
  rows: Row[];
  levels: string[];
  valueColumn: string;
  reverse: boolean;
  palette: "signal" | "mineral" | "citrus";
  background: string;
  transparent: boolean;
  showLabels: boolean;
  notation: "full" | "compact" | "percent";
  linkOpacity: number;
  nodeWidth: number;
  aspect: string;
  backgroundImage?: string;
  nodeImageColumn?: string;
  nodeAssets: Record<string, string>;
  nodeOrder: Record<number, string[]>;
  isPrivate: boolean;
  createdAt: string;
  upvotes: number;
  downvotes: number;
};

export function createChartId() {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `sk-${Date.now().toString(36)}-${random}`;
}

const OWNED_CHARTS_KEY = "sankey-studio-owned-charts";

function readOwnedCharts(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(OWNED_CHARTS_KEY) ?? "{}");
    return value && typeof value === "object" ? (value as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function rememberOwnedChart(chartId: string, ownerSecret: string) {
  if (typeof window === "undefined") return;
  const owned = readOwnedCharts();
  owned[chartId] = ownerSecret;
  try {
    window.localStorage.setItem(OWNED_CHARTS_KEY, JSON.stringify(owned));
  } catch {
    // The item is still saved online; it just won't be deletable from this browser later.
  }
}

function forgetOwnedChart(chartId: string) {
  if (typeof window === "undefined") return;
  const owned = readOwnedCharts();
  delete owned[chartId];
  try {
    window.localStorage.setItem(OWNED_CHARTS_KEY, JSON.stringify(owned));
  } catch {
    // Ignore.
  }
}

export function ownsGalleryItem(chartId: string): boolean {
  return chartId in readOwnedCharts();
}

const VOTER_ID_KEY = "sankey-studio-voter-id";
const MY_VOTES_KEY = "sankey-studio-my-votes";

function getVoterId(): string {
  if (typeof window === "undefined") return crypto.randomUUID();
  try {
    const existing = window.localStorage.getItem(VOTER_ID_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.localStorage.setItem(VOTER_ID_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

function readMyVotes(): Record<string, 1 | -1> {
  if (typeof window === "undefined") return {};
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(MY_VOTES_KEY) ?? "{}");
    return value && typeof value === "object" ? (value as Record<string, 1 | -1>) : {};
  } catch {
    return {};
  }
}

export function myGalleryVote(chartId: string): 1 | -1 | 0 {
  return readMyVotes()[chartId] ?? 0;
}

type GalleryRow = {
  chart_id: string;
  title: string;
  description: string;
  columns: string[];
  rows: Row[];
  levels: string[];
  value_column: string;
  reverse: boolean;
  palette: "signal" | "mineral" | "citrus";
  background: string;
  transparent: boolean;
  show_labels: boolean;
  notation: "full" | "compact" | "percent";
  link_opacity: number;
  node_width: number;
  aspect: string;
  background_image: string | null;
  node_image_column: string | null;
  node_assets: Record<string, string>;
  node_order?: Record<string, string[]> | null;
  is_private?: boolean | null;
  created_at: string;
  upvotes?: number;
  downvotes?: number;
};

function fromRow(row: GalleryRow): GalleryItem {
  return {
    chartId: row.chart_id,
    title: row.title,
    description: row.description,
    columns: row.columns,
    rows: row.rows,
    levels: row.levels,
    valueColumn: row.value_column,
    reverse: row.reverse,
    palette: row.palette,
    background: row.background,
    transparent: row.transparent,
    showLabels: row.show_labels,
    notation: row.notation,
    linkOpacity: row.link_opacity,
    nodeWidth: row.node_width,
    aspect: row.aspect,
    backgroundImage: row.background_image ?? undefined,
    nodeImageColumn: row.node_image_column ?? undefined,
    nodeAssets: row.node_assets ?? {},
    nodeOrder: row.node_order ?? {},
    isPrivate: row.is_private ?? false,
    createdAt: row.created_at,
    upvotes: row.upvotes ?? 0,
    downvotes: row.downvotes ?? 0,
  };
}

export async function fetchGallery(): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from("gallery_items_public")
    .select("*")
    .order("score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(40);
  if (error || !data) return [];
  return (data as GalleryRow[]).map(fromRow);
}

export async function fetchGalleryItem(chartId: string): Promise<GalleryItem | null> {
  const { data, error } = await supabase
    .from("gallery_items_public")
    .select("*")
    .eq("chart_id", chartId)
    .maybeSingle();
  if (!error && data) return fromRow(data as GalleryRow);

  // Not in the public gallery -- could be private. This only ever resolves
  // for the chart's own signed-in owner (server-checked via the verified
  // Clerk identity), so a non-owner or anonymous caller sees the same
  // not-found result as a chart that never existed.
  const mine = await supabase.rpc("get_my_gallery_item", { p_chart_id: chartId });
  if (mine.error || !mine.data || !Array.isArray(mine.data) || mine.data.length === 0) return null;
  return fromRow(mine.data[0] as GalleryRow);
}

export async function fetchMyGalleryItems(): Promise<GalleryItem[]> {
  const { data, error } = await supabase.rpc("list_my_gallery_items");
  if (error || !data) return [];
  return (data as GalleryRow[]).map(fromRow);
}

export type SaveGalleryResult = { ok: true; item: GalleryItem } | { ok: false; reason: "too_large" | "network" };

export async function createGalleryItem(item: Omit<GalleryItem, "createdAt" | "upvotes" | "downvotes">): Promise<SaveGalleryResult> {
  const ownerSecret = crypto.randomUUID();
  const { data, error } = await supabase.rpc("create_gallery_item", {
    payload: {
      chartId: item.chartId,
      title: item.title,
      description: item.description,
      columns: item.columns,
      rows: item.rows,
      levels: item.levels,
      valueColumn: item.valueColumn,
      reverse: item.reverse,
      palette: item.palette,
      background: item.background,
      transparent: item.transparent,
      showLabels: item.showLabels,
      notation: item.notation,
      linkOpacity: item.linkOpacity,
      nodeWidth: item.nodeWidth,
      aspect: item.aspect,
      backgroundImage: item.backgroundImage ?? null,
      nodeImageColumn: item.nodeImageColumn ?? null,
      nodeAssets: item.nodeAssets,
      nodeOrder: item.nodeOrder ?? {},
      isPrivate: item.isPrivate,
    },
    p_owner_secret: ownerSecret,
  });
  if (error || !data || !Array.isArray(data) || data.length === 0) {
    const tooLarge = Boolean(error?.message?.includes("too large"));
    return { ok: false, reason: tooLarge ? "too_large" : "network" };
  }
  rememberOwnedChart(item.chartId, ownerSecret);
  // A private chart's SVG is never uploaded to the (public) CDN bucket --
  // an unlisted-but-fetchable file would defeat the point of "private".
  if (!item.isPrivate) await uploadGallerySnapshot(item);
  return { ok: true, item: fromRow(data[0] as GalleryRow) };
}

export async function deleteGalleryItem(chartId: string): Promise<boolean> {
  const ownerSecret = readOwnedCharts()[chartId];
  // Always call through: a signed-in user can also delete a chart they made
  // on a different browser/device, verified server-side via Clerk identity
  // rather than the local secret, which that browser never had to begin with.
  const { data, error } = await supabase.rpc("delete_gallery_item", {
    p_chart_id: chartId,
    p_owner_secret: ownerSecret ?? "",
  });
  if (error || !data) return false;
  if (ownerSecret) forgetOwnedChart(chartId);
  return true;
}

export type VoteResult = { ok: true; upvotes: number; downvotes: number; myVote: 1 | -1 | 0 } | { ok: false };

export async function voteOnGalleryItem(chartId: string, vote: 1 | -1): Promise<VoteResult> {
  const voterId = getVoterId();
  const { data, error } = await supabase.rpc("vote_gallery_item", {
    p_chart_id: chartId,
    p_voter_id: voterId,
    p_vote: vote,
  });
  if (error || !data || !Array.isArray(data) || data.length === 0) return { ok: false };

  const current = readMyVotes();
  const wasSameVote = current[chartId] === vote;
  if (wasSameVote) delete current[chartId]; else current[chartId] = vote;
  try {
    window.localStorage.setItem(MY_VOTES_KEY, JSON.stringify(current));
  } catch {
    // Vote still recorded server-side; only the local "you voted" highlight is affected.
  }

  const row = data[0] as { upvotes: number; downvotes: number };
  return { ok: true, upvotes: row.upvotes, downvotes: row.downvotes, myVote: wasSameVote ? 0 : vote };
}

export type ReportReason = "inappropriate" | "spam" | "personal_data" | "other";
const MY_REPORTS_KEY = "sankey-studio-my-reports";

function readMyReports(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(MY_REPORTS_KEY) ?? "[]");
    return Array.isArray(value) ? (value as string[]) : [];
  } catch {
    return [];
  }
}

export function hasReportedGalleryItem(chartId: string): boolean {
  return readMyReports().includes(chartId);
}

// Reports aren't reviewed automatically -- there's no admin UI or auto-hide
// (an anonymous report count is too easy to game into hiding legitimate
// charts). They land in a table only the project owner can query directly,
// for manual review and takedown.
export async function reportGalleryItem(chartId: string, reason: ReportReason, note?: string): Promise<boolean> {
  const reporterId = getVoterId();
  const { data, error } = await supabase.rpc("report_gallery_item", {
    p_chart_id: chartId,
    p_reporter_id: reporterId,
    p_reason: reason,
    p_note: note?.slice(0, 200) || null,
  });
  if (error) return false;
  const reports = readMyReports();
  if (!reports.includes(chartId)) {
    try {
      window.localStorage.setItem(MY_REPORTS_KEY, JSON.stringify([...reports, chartId]));
    } catch {
      // Non-critical: the report was still recorded server-side.
    }
  }
  return Boolean(data);
}
