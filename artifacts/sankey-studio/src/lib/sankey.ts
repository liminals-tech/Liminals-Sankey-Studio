import type { Row } from "@/data/templates";

export type SankeyNode = { id: string; label: string; level: number; value: number; x: number; y: number; w: number; h: number; color: string };
export type SankeyLink = { id: string; source: SankeyNode; target: SankeyNode; value: number; sy: number; ty: number; thickness: number; path: string };
export type SankeyModel = { nodes: SankeyNode[]; links: SankeyLink[]; total: number; levels: string[] };

const palettes = {
  signal: ["#ef7957", "#278f86", "#c99d43", "#5b8790", "#be6451", "#83965a", "#8e7665", "#4a9b91"],
  mineral: ["#5b8790", "#82936d", "#b58e65", "#73858b", "#c18a77", "#627b73", "#a59b76", "#4c7077"],
  citrus: ["#d86d4f", "#d99f3d", "#8da44d", "#c66d49", "#e2bb58", "#5e9888", "#bb7b4e", "#79975b"],
};
const finite = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : Number(value) || 0;

export function buildSankeyModel(rows: Row[], levels: string[], valueColumn: string, reverse = false, paletteName: keyof typeof palettes = "signal", nodeWidth = 14): SankeyModel {
  const columns = reverse ? [...levels].reverse() : levels;
  const grouped = new Map<string, number>();
  rows.forEach((row) => {
    const value = finite(row[valueColumn]);
    if (value <= 0 || !columns.every((level) => String(row[level] ?? "").trim())) return;
    for (let index = 0; index < columns.length - 1; index += 1) {
      const key = `${String(row[columns[index]])}\u0000${String(row[columns[index + 1]])}\u0000${index}`;
      grouped.set(key, (grouped.get(key) ?? 0) + value);
    }
  });
  const nodeMap = new Map<string, SankeyNode>();
  const getNode = (label: string, level: number) => {
    const id = `${level}:${label}`;
    const existing = nodeMap.get(id);
    if (existing) return existing;
    const palette = palettes[paletteName];
    const node: SankeyNode = { id, label, level, value: 0, x: 0, y: 0, w: nodeWidth, h: 20, color: palette[level % palette.length] };
    nodeMap.set(id, node);
    return node;
  };
  const rawLinks: Array<{ source: SankeyNode; target: SankeyNode; value: number }> = [];
  grouped.forEach((value, key) => {
    const [sourceLabel, targetLabel, levelText] = key.split("\u0000");
    const level = Number(levelText);
    const source = getNode(sourceLabel, level);
    const target = getNode(targetLabel, level + 1);
    source.value += value; target.value += value;
    rawLinks.push({ source, target, value });
  });
  const total = rawLinks.reduce((sum, link) => sum + (link.source.level === 0 ? link.value : 0), 0);
  const width = 1000, height = 560, left = 70, right = 70, top = 48, bottom = 45;
  const gap = 18;
  const levelCount = Math.max(columns.length, 1);
  const innerWidth = width - left - right;
  const innerHeight = height - top - bottom;
  [...Array(levelCount)].forEach((_, level) => {
    const nodes = [...nodeMap.values()].filter((node) => node.level === level);
    const max = Math.max(...nodes.map((node) => node.value), 1);
    const usable = innerHeight - Math.max(0, nodes.length - 1) * gap;
    let y = top;
    nodes.forEach((node) => {
      node.x = left + (levelCount === 1 ? innerWidth / 2 : (level / (levelCount - 1)) * innerWidth);
      node.h = Math.max(18, usable * (node.value / max) * 0.74);
      node.y = y;
      y += node.h + gap;
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

export const formatValue = (value: number, notation: "full" | "compact" | "percent") => {
  const safe = Number.isFinite(value) ? value : 0;
  if (notation === "percent") return `${safe.toFixed(1)}%`;
  if (notation === "compact") return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(safe);
  return new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(safe);
};