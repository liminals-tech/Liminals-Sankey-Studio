import type { Row } from "@/data/templates";
import { sanitizeImageSource } from "@/lib/images";

export type SankeyNode = { id: string; label: string; level: number; value: number; x: number; y: number; w: number; h: number; color: string; image?: string };
export type SankeyLink = { id: string; source: SankeyNode; target: SankeyNode; value: number; sy: number; ty: number; thickness: number; path: string };
export type SankeyModel = { nodes: SankeyNode[]; links: SankeyLink[]; total: number; levels: string[] };
export type SankeyLayoutOptions = { width?: number; height?: number; left?: number; right?: number; top?: number; bottom?: number; gap?: number };

const palettes = {
  signal: ["#ef7957", "#278f86", "#c99d43", "#5b8790", "#be6451", "#83965a", "#8e7665", "#4a9b91"],
  mineral: ["#5b8790", "#82936d", "#b58e65", "#73858b", "#c18a77", "#627b73", "#a59b76", "#4c7077"],
  citrus: ["#d86d4f", "#d99f3d", "#8da44d", "#c66d49", "#e2bb58", "#5e9888", "#bb7b4e", "#79975b"],
};
const finite = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : Number(value) || 0;

export function buildSankeyModel(rows: Row[], levels: string[], valueColumn: string, reverse = false, paletteName: keyof typeof palettes = "signal", nodeWidth = 14, imageColumn = "", nodeAssets: Record<string, string> = {}): SankeyModel {
  const columns = reverse ? [...levels].reverse() : levels;
  const grouped = new Map<string, number>();
  const rowImages = new Map<string, string>();
  rows.forEach((row) => {
    const value = finite(row[valueColumn]);
    if (value <= 0 || !columns.every((level) => String(row[level] ?? "").trim())) return;
    const image = sanitizeImageSource(row[imageColumn]);
    for (let index = 0; index < columns.length - 1; index += 1) {
      const key = `${String(row[columns[index]])}\u0000${String(row[columns[index + 1]])}\u0000${index}`;
      grouped.set(key, (grouped.get(key) ?? 0) + value);
    }
    if (image) columns.forEach((column, index) => rowImages.set(`${index}:${String(row[column])}`, image));
  });
  const nodeMap = new Map<string, SankeyNode>();
  const getNode = (label: string, level: number) => {
    const id = `${level}:${label}`;
    const existing = nodeMap.get(id);
    if (existing) return existing;
    const palette = palettes[paletteName];
    const node: SankeyNode = { id, label, level, value: 0, x: 0, y: 0, w: nodeWidth, h: 20, color: palette[level % palette.length], image: nodeAssets[id] || rowImages.get(id) };
    nodeMap.set(id, node);
    return node;
  };
  const rawLinks: Array<{ source: SankeyNode; target: SankeyNode; value: number }> = [];
  grouped.forEach((value, key) => {
    const [sourceLabel, targetLabel, levelText] = key.split("\u0000");
    const level = Number(levelText);
    const source = getNode(sourceLabel, level);
    const target = getNode(targetLabel, level + 1);
    rawLinks.push({ source, target, value });
  });
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, number>();
  rawLinks.forEach(({ source, target, value }) => {
    outgoing.set(source.id, (outgoing.get(source.id) ?? 0) + value);
    incoming.set(target.id, (incoming.get(target.id) ?? 0) + value);
  });
  nodeMap.forEach((node) => {
    node.value = node.level === 0 ? (outgoing.get(node.id) ?? 0) : (incoming.get(node.id) ?? 0);
  });
  const total = rawLinks.reduce((sum, link) => sum + (link.source.level === 0 ? link.value : 0), 0);
  const width = 1220, height = 560, left = 170, right = 190, top = 48, bottom = 45;
  const gap = 18;
  const levelCount = Math.max(columns.length, 1);
  const innerWidth = width - left - right;
  const innerHeight = height - top - bottom;
  const nodesByLevel = [...Array(levelCount)].map((_, level) => [...nodeMap.values()].filter((node) => node.level === level));
  const minNodeHeight = 10;
  const maxNodeCount = Math.max(...nodesByLevel.map((nodes) => nodes.length), 1);
  const visualGap = maxNodeCount > 1 ? Math.min(gap, Math.max(6, (innerHeight - maxNodeCount * minNodeHeight) / (maxNodeCount - 1))) : 0;
  const sharedScale = Math.min(...nodesByLevel.filter((nodes) => nodes.length > 0).map((nodes) => (innerHeight - Math.max(0, nodes.length - 1) * visualGap) / Math.max(nodes.reduce((sum, node) => sum + node.value, 0), 1)), 1);
  nodesByLevel.forEach((nodes, level) => {
    let y = top;
    nodes.forEach((node) => {
      node.x = left + (levelCount === 1 ? innerWidth / 2 : (level / (levelCount - 1)) * innerWidth);
      node.h = Math.max(minNodeHeight, node.value * sharedScale);
      node.y = y;
      y += node.h + visualGap;
    });
  });
  const offsets = new Map<string, number>();
  const links = rawLinks.map(({ source, target, value }, index) => {
    const thickness = Math.max(3, (value / Math.max(source.value, target.value, 1)) * source.h * 0.78);
    const sy = source.y + (offsets.get(`s:${source.id}`) ?? 0) + thickness / 2;
    const ty = target.y + (offsets.get(`t:${target.id}`) ?? 0) + thickness / 2;
    offsets.set(`s:${source.id}`, (offsets.get(`s:${source.id}`) ?? 0) + thickness);
    offsets.set(`t:${target.id}`, (offsets.get(`t:${target.id}`) ?? 0) + thickness);
    const x1 = source.x + source.w, x2 = target.x;
    const curve = Math.max(40, (x2 - x1) * 0.48);
    const path = `M ${x1} ${sy - thickness / 2} C ${x1 + curve} ${sy - thickness / 2}, ${x2 - curve} ${ty - thickness / 2}, ${x2} ${ty - thickness / 2} L ${x2} ${ty + thickness / 2} C ${x2 - curve} ${ty + thickness / 2}, ${x1 + curve} ${sy + thickness / 2}, ${x1} ${sy + thickness / 2} Z`;
    return { id: `link-${index}`, source, target, value, sy, ty, thickness, path };
  });
  return { nodes: [...nodeMap.values()], links, total, levels: columns };
}

export function relayoutSankeyModel(model: SankeyModel, options: SankeyLayoutOptions = {}): SankeyModel {
  const width = options.width ?? 1220;
  const height = options.height ?? 560;
  const left = options.left ?? 170;
  const right = options.right ?? 190;
  const top = options.top ?? 48;
  const bottom = options.bottom ?? 45;
  const gap = options.gap ?? 18;
  const innerWidth = Math.max(1, width - left - right);
  const innerHeight = Math.max(1, height - top - bottom);
  const nodes = model.nodes.map((node) => ({ ...node }));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const levelCount = Math.max(model.levels.length, 1);
  const nodesByLevel = [...Array(levelCount)].map((_, level) => nodes.filter((node) => node.level === level));
  const maxNodeCount = Math.max(...nodesByLevel.map((levelNodes) => levelNodes.length), 1);
  const minNodeHeight = 10;
  const visualGap = maxNodeCount > 1 ? Math.min(gap, Math.max(6, (innerHeight - maxNodeCount * minNodeHeight) / (maxNodeCount - 1))) : 0;
  const sharedScale = Math.min(
    ...nodesByLevel.filter((levelNodes) => levelNodes.length > 0).map((levelNodes) => (innerHeight - Math.max(0, levelNodes.length - 1) * visualGap) / Math.max(levelNodes.reduce((sum, node) => sum + node.value, 0), 1)),
    1,
  );

  nodesByLevel.forEach((levelNodes, level) => {
    let y = top;
    levelNodes.forEach((node) => {
      node.x = left + (levelCount === 1 ? innerWidth / 2 : (level / (levelCount - 1)) * innerWidth);
      node.h = Math.max(minNodeHeight, node.value * sharedScale);
      node.y = y;
      y += node.h + visualGap;
    });
  });

  const offsets = new Map<string, number>();
  const links = model.links.map((link) => {
    const source = nodeById.get(link.source.id);
    const target = nodeById.get(link.target.id);
    if (!source || !target) return link;
    const thickness = Math.max(3, (link.value / Math.max(source.value, target.value, 1)) * source.h * 0.78);
    const sy = source.y + (offsets.get(`s:${source.id}`) ?? 0) + thickness / 2;
    const ty = target.y + (offsets.get(`t:${target.id}`) ?? 0) + thickness / 2;
    offsets.set(`s:${source.id}`, (offsets.get(`s:${source.id}`) ?? 0) + thickness);
    offsets.set(`t:${target.id}`, (offsets.get(`t:${target.id}`) ?? 0) + thickness);
    const x1 = source.x + source.w;
    const x2 = target.x;
    const curve = Math.max(40, (x2 - x1) * 0.48);
    const path = `M ${x1} ${sy - thickness / 2} C ${x1 + curve} ${sy - thickness / 2}, ${x2 - curve} ${ty - thickness / 2}, ${x2} ${ty - thickness / 2} L ${x2} ${ty + thickness / 2} C ${x2 - curve} ${ty + thickness / 2}, ${x1 + curve} ${sy + thickness / 2}, ${x1} ${sy + thickness / 2} Z`;
    return { ...link, source, target, sy, ty, thickness, path };
  });

  return { ...model, nodes, links };
}

export function getSankeyLabelFontSize(model: SankeyModel, level: number, availableHeight: number) {
  const count = Math.max(model.nodes.filter((node) => node.level === level).length, 1);
  return Math.max(8, Math.min(14, availableHeight / (count * 1.55)));
}

export const formatValue = (value: number, notation: "full" | "compact" | "percent") => {
  const safe = Number.isFinite(value) ? value : 0;
  if (notation === "percent") return `${safe.toFixed(1)}%`;
  if (notation === "compact") return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(safe);
  return new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(safe);
};