// Shared motion constants + hash for the CPU vs GPU comparison demo. The CPU
// path (demo.tsx) and the GPU path (gpu-particles.vert) must compute the
// EXACT same drift so the two panels stay visually identical — only the
// hash's magic constant (43758.5453, a common GLSL hash idiom) has to be
// duplicated by hand in the .vert file, since GLSL can't import this module.

export const SPREAD = 1.4;
export const AMPLITUDE = 0.55;
export const SPEED = 0.6;

export function hash(n: number): number {
  const s = Math.sin(n) * 43758.5453;
  return s - Math.floor(s);
}

/** Deterministic per-particle seeds, shared by both panels for a fair comparison. */
export function buildSeeds(count: number): Float32Array {
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    seeds[i] = hash(i * 0.013 + 1.7) * 1000;
  }
  return seeds;
}

/** The CPU particle loop this lesson is about: N iterations, writes Float32Array. */
export function updateCpuPositions(
  positions: Float32Array,
  seeds: Float32Array,
  t: number,
  count: number,
): void {
  for (let i = 0; i < count; i++) {
    const seed = seeds[i]!;
    const px = (hash(seed) * 2 - 1) * SPREAD;
    const py = (hash(seed + 1) * 2 - 1) * SPREAD;
    const pz = (hash(seed + 2) * 2 - 1) * SPREAD;
    const phase = hash(seed + 3) * Math.PI * 2;

    const o = i * 3;
    positions[o] = px + Math.sin(t * SPEED + phase) * AMPLITUDE;
    positions[o + 1] = py + Math.cos(t * SPEED + phase * 1.3) * AMPLITUDE;
    positions[o + 2] = pz + Math.sin(t * SPEED * 0.7 + phase * 0.6) * AMPLITUDE;
  }
}
