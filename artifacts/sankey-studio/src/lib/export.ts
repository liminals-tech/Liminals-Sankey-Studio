import type { SankeyModel } from "@/lib/sankey";
import { formatValue } from "@/lib/sankey";

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function modelToSvg(model: SankeyModel, options: { title: string; subtitle: string; background: string; transparent: boolean; showLabels: boolean; notation: "full" | "compact" | "percent" }) {
  const bg = options.transparent ? "none" : options.background;
  const title = escapeXml(options.title);
  const subtitle = escapeXml(options.subtitle);
  const labels = options.showLabels ? model.nodes.map((node) => `<text x="${node.x < 500 ? node.x - 10 : node.x + node.w + 10}" y="${node.y + node.h / 2 + 4}" text-anchor="${node.x < 500 ? "end" : "start"}" fill="#243033" font-family="DM Sans, sans-serif" font-size="14">${escapeXml(node.label)} · ${formatValue(node.value, options.notation)}</text>`).join("") : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 650"><rect width="1000" height="650" fill="${bg}"/><text x="70" y="35" fill="#243033" font-family="DM Sans, sans-serif" font-size="18" font-weight="600">${title}</text><text x="70" y="57" fill="#6a7372" font-family="DM Sans, sans-serif" font-size="12">${subtitle}</text><g>${model.links.map((link) => `<path d="${link.path}" fill="${link.source.color}" opacity=".3"/>`).join("")}</g><g>${model.nodes.map((node) => `<rect x="${node.x}" y="${node.y}" width="${node.w}" height="${node.h}" rx="3" fill="${node.color}"/>`).join("")}</g><g>${labels}</g></svg>`;
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[character] ?? character));
}

export function exportSvg(model: SankeyModel, options: Parameters<typeof modelToSvg>[1], filename = "sankey-studio.svg") {
  downloadBlob(new Blob([modelToSvg(model, options)], { type: "image/svg+xml" }), filename);
}

export async function exportPng(model: SankeyModel, options: Parameters<typeof modelToSvg>[1], scale = 1, filename = "sankey-studio.png") {
  const svg = modelToSvg(model, options);
  const image = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Could not export image")); image.src = url; });
  const canvas = document.createElement("canvas"); canvas.width = 1000 * scale; canvas.height = 650 * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas export is not supported");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);
  await new Promise<void>((resolve) => canvas.toBlob((blob) => { if (blob) downloadBlob(blob, filename); resolve(); }, "image/png"));
}