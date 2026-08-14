// Pure formula this lesson teaches: B = W * H * bytesPerTexel * mipFactor.
// Kept dependency-free (no THREE import) so the ledger math is trivially
// testable/readable apart from the demo's imperative texture creation.

export type TextureFormat = "rgba8" | "half";

/** 4 for RGBA8 (1 byte/channel), 8 for half-float RGBA (2 bytes/channel). */
export const BYTES_PER_TEXEL: Record<TextureFormat, number> = {
  rgba8: 4,
  half: 8,
};

/** The 1 + 1/4 + 1/16 + ... = 4/3 mip-chain tax, applied only when mipmaps exist. */
const MIP_FACTOR = 4 / 3;

export function textureFootprintBytes(
  sizePx: number,
  format: TextureFormat,
  mipmaps: boolean,
): number {
  const base = sizePx * sizePx * BYTES_PER_TEXEL[format];
  return mipmaps ? base * MIP_FACTOR : base;
}

export function bytesToMB(bytes: number): number {
  return bytes / (1024 * 1024);
}

export const TEXTURE_SIZES = [512, 1024, 2048, 4096] as const;
