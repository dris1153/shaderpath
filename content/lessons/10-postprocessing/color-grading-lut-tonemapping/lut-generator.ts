import * as THREE from "three";

// No binary assets in the repo (spec): every LUT here is baked on the CPU
// from a small color formula instead of loaded from a .cube file.
export type LutKind = "neutral" | "teal-orange" | "bleach-bypass";

export const LUT_SIZE = 16;

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function luminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

// Split-tone: push shadows teal, highlights orange, then a mild S-curve —
// the same shape a "cinematic" LUT from a grading tool produces.
function tealOrange(r: number, g: number, b: number): [number, number, number] {
  const l = luminance(r, g, b);
  const shadow = 1 - smoothstep(0.1, 0.55, l);
  const highlight = smoothstep(0.45, 0.9, l);

  let nr = r + highlight * 0.16 - shadow * 0.02;
  let ng = g + highlight * 0.03 + shadow * 0.01;
  let nb = b + shadow * 0.18 - highlight * 0.1;

  const curve = (c: number) => {
    const s = smoothstep(0, 1, clamp01(c));
    return clamp01(s * 0.8 + c * 0.2);
  };
  nr = curve(nr);
  ng = curve(ng);
  nb = curve(nb);
  return [nr, ng, nb];
}

// Bleach bypass (skipped silver retention in film processing): partial
// desaturation toward luminance plus punched-up contrast around mid-gray.
function bleachBypass(r: number, g: number, b: number): [number, number, number] {
  const l = luminance(r, g, b);
  const desat = 0.55;
  const dr = r + (l - r) * desat;
  const dg = g + (l - g) * desat;
  const db = b + (l - b) * desat;

  const contrast = (c: number) => clamp01((c - 0.5) * 1.35 + 0.5);
  return [contrast(dr), contrast(dg), contrast(db)];
}

const TRANSFORMS: Record<LutKind, ((r: number, g: number, b: number) => [number, number, number]) | null> = {
  neutral: null,
  "teal-orange": tealOrange,
  "bleach-bypass": bleachBypass,
};

/**
 * Bakes a size^3 lattice into a Data3DTexture. Axis order matches the
 * sampling convention in grading-pass.frag: u=R, v=G, w(depth)=B.
 */
export function generateLut(kind: LutKind, size = LUT_SIZE): THREE.Data3DTexture {
  const transform = TRANSFORMS[kind];
  const data = new Uint8Array(size * size * size * 4);

  let i = 0;
  for (let bz = 0; bz < size; bz++) {
    for (let gy = 0; gy < size; gy++) {
      for (let rx = 0; rx < size; rx++) {
        const r0 = rx / (size - 1);
        const g0 = gy / (size - 1);
        const b0 = bz / (size - 1);
        const [r, g, b] = transform ? transform(r0, g0, b0) : [r0, g0, b0];
        data[i++] = Math.round(clamp01(r) * 255);
        data[i++] = Math.round(clamp01(g) * 255);
        data[i++] = Math.round(clamp01(b) * 255);
        data[i++] = 255;
      }
    }
  }

  const texture = new THREE.Data3DTexture(data, size, size, size);
  texture.format = THREE.RGBAFormat;
  texture.type = THREE.UnsignedByteType;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.wrapR = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}
