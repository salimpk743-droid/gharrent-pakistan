export type AllowedImageMime = "image/jpeg" | "image/png" | "image/webp";

const ALLOWED: AllowedImageMime[] = ["image/jpeg", "image/png", "image/webp"];

function bytesFromBase64Prefix(base64: string): Uint8Array {
  const raw = base64.includes(",") ? base64.slice(base64.indexOf(",") + 1) : base64;
  const slice = raw.slice(0, 48);
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(slice, "base64"));
  }
  const bin = atob(slice);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

export function sniffImageMime(data: string | Uint8Array): AllowedImageMime | null {
  const bytes = typeof data === "string" ? bytesFromBase64Prefix(data) : data;
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  const webp = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  if (riff === "RIFF" && webp === "WEBP") return "image/webp";
  return null;
}

export function isAllowedImageMime(mime: string | null | undefined): mime is AllowedImageMime {
  return Boolean(mime && ALLOWED.includes(mime as AllowedImageMime));
}

export function decodeBase64Payload(dataUrlOrBase64: string): { mime: AllowedImageMime; bytes: Uint8Array; raw: string } {
  const raw = dataUrlOrBase64.includes(",")
    ? dataUrlOrBase64.slice(dataUrlOrBase64.indexOf(",") + 1)
    : dataUrlOrBase64;
  const mime = sniffImageMime(raw);
  if (!mime) {
    throw new Error("Only JPEG, PNG and WebP images are allowed.");
  }
  const bytes =
    typeof Buffer !== "undefined"
      ? new Uint8Array(Buffer.from(raw, "base64"))
      : Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
  return { mime, bytes, raw };
}

export function byteLengthOfBase64(raw: string): number {
  const clean = raw.replace(/\s/g, "");
  const padding = clean.endsWith("==") ? 2 : clean.endsWith("=") ? 1 : 0;
  return Math.floor((clean.length * 3) / 4) - padding;
}
