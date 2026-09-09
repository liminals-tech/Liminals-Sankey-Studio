import type { Row } from "@/data/templates";
import { supabase } from "@/lib/supabase";

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
  createdAt: string;
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
  created_at: string;
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
    createdAt: row.created_at,
  };
}

export async function fetchGallery(): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(40);
  if (error || !data) return [];
  return (data as GalleryRow[]).map(fromRow);
}

export type SaveGalleryResult = { ok: true; item: GalleryItem } | { ok: false; reason: "too_large" | "network" };

export async function createGalleryItem(item: Omit<GalleryItem, "createdAt">): Promise<SaveGalleryResult> {
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
    },
    p_owner_secret: ownerSecret,
  });
  if (error || !data || !Array.isArray(data) || data.length === 0) {
    const tooLarge = Boolean(error?.message?.includes("too large"));
    return { ok: false, reason: tooLarge ? "too_large" : "network" };
  }
  rememberOwnedChart(item.chartId, ownerSecret);
  return { ok: true, item: fromRow(data[0] as GalleryRow) };
}

export async function deleteGalleryItem(chartId: string): Promise<boolean> {
  const ownerSecret = readOwnedCharts()[chartId];
  if (!ownerSecret) return false;
  const { data, error } = await supabase.rpc("delete_gallery_item", {
    p_chart_id: chartId,
    p_owner_secret: ownerSecret,
  });
  if (error || !data) return false;
  forgetOwnedChart(chartId);
  return true;
}
