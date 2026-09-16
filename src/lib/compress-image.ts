const MAX_EDGE = 1600;
const QUALITY = 0.82;

export async function compressImageFile(file: File): Promise<{
  dataUrl: string;
  width: number;
  height: number;
  mime: string;
}> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose a JPEG, PNG or WebP image.");
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process that image. Try another file.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", QUALITY);
  return { dataUrl, width, height, mime: "image/jpeg" };
}
