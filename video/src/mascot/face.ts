// Frame-pure face timing: blinks from a seeded schedule, mouth from the voice's
// word timings. No audio analysis, so every render is identical.

// Deterministic 0..1 from an integer (mulberry32 step).
export function hash01(n: number): number {
  let t = (n + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const BLINK_FRAMES = 6;

// 0 = eyes open, 1 = shut. A blink every 70–160 frames, first after 30–90.
export function blinkAmount(frame: number, seed: number): number {
  let start = 30 + Math.floor(hash01(seed) * 60);
  let k = 1;
  while (start + BLINK_FRAMES <= frame) {
    start += 70 + Math.floor(hash01(seed * 997 + k) * 90);
    k++;
  }
  const d = frame - start;
  if (d < 0) return 0;
  const half = BLINK_FRAMES / 2;
  return d < half ? d / half : (BLINK_FRAMES - d) / half;
}

export type SpokenWord = { text: string; from: number; to: number };

// 0 = closed, 1 = wide open. One flap per ~4 letters of the word being spoken;
// closed between words, so pauses and holds read as listening.
export function mouthOpen(frame: number, words: SpokenWord[]): number {
  const w = words.find((word) => frame >= word.from && frame < word.to);
  if (!w) return 0;
  const letters = w.text.replace(/[^\p{L}\p{N}]/gu, "").length;
  const flaps = Math.max(1, Math.round(letters / 4));
  const p = (frame - w.from) / Math.max(1, w.to - w.from);
  return Math.sin(Math.PI * ((p * flaps) % 1));
}
