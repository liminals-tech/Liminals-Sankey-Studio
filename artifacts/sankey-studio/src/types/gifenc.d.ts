declare module "gifenc" {
  type GifPalette = number[][];
  type GifEncoder = {
    writeFrame: (index: Uint8Array, width: number, height: number, options?: { delay?: number; repeat?: number; palette?: GifPalette }) => void;
    finish: () => void;
    bytes: () => Uint8Array;
  };
  export function GIFEncoder(options?: { initialCapacity?: number; auto?: boolean }): GifEncoder;
  export function quantize(rgba: Uint8Array | Uint8ClampedArray, maxColors: number, options?: Record<string, unknown>): GifPalette;
  export function applyPalette(rgba: Uint8Array | Uint8ClampedArray, palette: GifPalette, format?: string): Uint8Array;
}