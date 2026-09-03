import type { Row } from "@/data/templates";

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
  mediaPersisted?: boolean;
  createdAt: string;
};

const STORAGE_KEY = "sankey-studio-gallery";

export function createChartId() {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `sk-${Date.now().toString(36)}-${random}`;
}

export function readGallery(): GalleryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is GalleryItem => Boolean(item && typeof item === "object" && "chartId" in item && "rows" in item && "columns" in item));
  } catch {
    return [];
  }
}

export function writeGallery(items: GalleryItem[]) {
  if (typeof window === "undefined") return { items, mediaDropped: false, ok: false };
  const limited = items.slice(0, 40);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    return { items: limited, mediaDropped: false, ok: true };
  } catch {
    const lightweight = limited.map((item) => ({ ...item, backgroundImage: undefined, nodeAssets: {}, mediaPersisted: false }));
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
      return { items: lightweight, mediaDropped: true, ok: true };
    } catch {
      return { items, mediaDropped: false, ok: false };
    }
  }
}

export function upsertGalleryItem(items: GalleryItem[], next: GalleryItem) {
  return [next, ...items.filter((item) => item.chartId !== next.chartId)].slice(0, 40);
}