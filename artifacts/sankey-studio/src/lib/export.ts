import type { SankeyModel } from "@/lib/sankey";
import { formatValue } from "@/lib/sankey";
import { GIFEncoder, applyPalette, quantize } from "gifenc";

export type SankeyExportOptions = {
  title: string;
  subtitle: string;
  background: string;
  transparent: boolean;
  showLabels: boolean;
  notation: "full" | "compact" | "percent";
  backgroundImage?: string;
  chartId?: string;
  revealProgress?: number;
};

export type SankeyGifOptions = {
  revealDurationMs: number;
  introHoldMs: number;
  outroHoldMs: number;
  fps?: number;
  onProgress?: (progress: number) => void;
};

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function modelToSvg(model: SankeyModel, options: SankeyExportOptions) {
  const bg = options.transparent ? "none" : options.background;
  const title = escapeXml(options.title);
  const subtitle = escapeXml(options.subtitle);
  const chartId = options.chartId ? escapeXml(options.chartId) : "";
  const backgroundImage = options.backgroundImage ? `<image href="${escapeXml(options.backgroundImage)}" x="0" y="0" width="1220" height="560" preserveAspectRatio="xMidYMid slice" opacity=".16"/>` : "";
  const reveal = options.revealProgress;
  const revealAlpha = (level: number) => reveal === undefined ? 1 : clamp(reveal * Math.max(model.levels.length, 1) - level + 1);
  const labels = options.showLabels ? model.nodes.map((node) => `<text opacity="${revealAlpha(node.level)}" x="${node.x < 500 ? node.x - 10 : node.x + node.w + 10}" y="${node.y + node.h / 2 + 4}" text-anchor="${node.x < 500 ? "end" : "start"}" fill="#243033" font-family="DM Sans, sans-serif" font-size="14">${escapeXml(node.label)} · ${formatValue(node.value, options.notation)}</text>`).join("") : "";
  const metadata = chartId ? `<metadata>sankey-studio-chart-id:${chartId}</metadata>` : "";
  const nodeImages = model.nodes.filter((node) => node.image).map((node) => `<image href="${escapeXml(node.image ?? "")}" x="${node.x - 5}" y="${node.y + Math.max(0, node.h / 2 - 14)}" width="${node.w + 10}" height="${Math.min(28, node.h)}" preserveAspectRatio="xMidYMid slice" opacity="${(.9 * revealAlpha(node.level)).toFixed(3)}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" data-sankey-id="${chartId}" viewBox="0 0 1220 650">${metadata}<rect width="1220" height="650" fill="${bg}"/>${backgroundImage}<text x="90" y="35" fill="#243033" font-family="DM Sans, sans-serif" font-size="18" font-weight="600">${title}</text><text x="90" y="57" fill="#6a7372" font-family="DM Sans, sans-serif" font-size="12">${subtitle}</text><g>${model.links.map((link) => `<path d="${link.path}" fill="${link.source.color}" opacity="${(.3 * Math.min(revealAlpha(link.source.level), revealAlpha(link.target.level))).toFixed(3)}"/>`).join("")}</g><g>${model.nodes.map((node) => `<rect opacity="${revealAlpha(node.level)}" x="${node.x}" y="${node.y}" width="${node.w}" height="${node.h}" rx="3" fill="${node.color}"/>`).join("")}${nodeImages}</g><g>${labels}</g></svg>`;
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[character] ?? character));
}

export function exportSvg(model: SankeyModel, options: SankeyExportOptions, filename = "sankey-studio.svg") {
  downloadBlob(new Blob([modelToSvg(model, options)], { type: "image/svg+xml" }), filename);
}

export async function exportPng(model: SankeyModel, options: SankeyExportOptions, scale = 1, filename = "sankey-studio.png") {
  const svg = modelToSvg(model, options);
  const image = new Image();
  image.crossOrigin = "anonymous";
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Could not export image")); image.src = url; });
  const canvas = document.createElement("canvas"); canvas.width = 1000 * scale; canvas.height = 650 * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas export is not supported");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);
  await new Promise<void>((resolve) => canvas.toBlob((blob) => { if (blob) downloadBlob(blob, filename); resolve(); }, "image/png"));
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const waitForFrame = () => new Promise<void>((resolve) => window.setTimeout(resolve, 0));

async function svgToRgba(svg: string, width: number, height: number) {
  const image = new Image();
  image.crossOrigin = "anonymous";
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not render an animation frame"));
      image.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas export is not supported");
    context.fillStyle = "#f8f5ed";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return context.getImageData(0, 0, width, height).data;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function exportGif(model: SankeyModel, options: SankeyExportOptions, gifOptions: SankeyGifOptions, filename = "sankey-studio.gif") {
  const width = 720;
  const height = 384;
  const fps = Math.min(12, Math.max(6, gifOptions.fps ?? 10));
  const frameDelay = Math.round(1000 / fps);
  const introFrames = Math.max(0, Math.round(gifOptions.introHoldMs / frameDelay));
  const revealFrames = Math.max(2, Math.round(gifOptions.revealDurationMs / frameDelay));
  const outroFrames = Math.max(0, Math.round(gifOptions.outroHoldMs / frameDelay));
  const totalFrames = Math.max(1, introFrames + revealFrames + outroFrames);
  const frameOptions = { ...options, transparent: false };
  const finalRgba = await svgToRgba(modelToSvg(model, { ...frameOptions, revealProgress: 1 }), width, height);
  const palette = quantize(finalRgba, 256);
  const gif = GIFEncoder();
  let frame = 0;
  const write = async (revealProgress: number) => {
    const rgba = await svgToRgba(modelToSvg(model, { ...frameOptions, revealProgress }), width, height);
    gif.writeFrame(applyPalette(rgba, palette), width, height, { delay: frameDelay, repeat: 0, palette: frame === 0 ? palette : undefined });
    frame += 1;
    gifOptions.onProgress?.(frame / totalFrames);
    await waitForFrame();
  };
  for (let index = 0; index < introFrames; index += 1) await write(0);
  for (let index = 0; index < revealFrames; index += 1) await write((index + 1) / revealFrames);
  for (let index = 0; index < outroFrames; index += 1) await write(1);
  gif.finish();
  const gifBytes = gif.bytes();
  downloadBlob(new Blob([gifBytes as unknown as ArrayBuffer], { type: "image/gif" }), filename);
}