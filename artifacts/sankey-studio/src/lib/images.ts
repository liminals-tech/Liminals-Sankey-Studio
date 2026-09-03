const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function sanitizeImageSource(value: unknown): string | undefined {
  const source = String(value ?? "").trim();
  if (!source) return undefined;
  if (source.startsWith("data:image/")) return source;
  try {
    const url = new URL(source);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Choose an image file."));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      reject(new Error("Images must be smaller than 5 MB."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? sanitizeImageSource(reader.result) : undefined;
      if (result) resolve(result);
      else reject(new Error("Could not read this image."));
    };
    reader.onerror = () => reject(new Error("Could not read this image."));
    reader.readAsDataURL(file);
  });
}