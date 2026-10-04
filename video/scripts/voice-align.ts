// Checks that a voice track lines up with its word timings. A track whose speech has been
// shifted or cut (a bad normalize or a bad fit) still has the right length, so the length
// alone does not catch it; this looks at where the sound actually is.
export const BIN_SEC = 0.25;
export const SILENT_RMS = 0.01;
// Natural pauses between words measure 2–8% on the real lessons. A voice moved by a second or more
// against its words lands at ~13–26% on a lesson (silence is spread through it) and 30–70% on
// a sparse fixture, so the limit sits just above the natural range.
export const MAX_SILENT_IN_WORDS = 0.15;

// Samples of a 16-bit PCM mono WAV as floats in [-1, 1], found by walking its chunks.
export function wavSamples(wav: Buffer): Float32Array {
  let at = 12;
  while (at + 8 <= wav.length) {
    const id = wav.toString("ascii", at, at + 4);
    const size = wav.readUInt32LE(at + 4);
    if (id === "data") {
      const bytes = Math.min(size, wav.length - at - 8);
      const out = new Float32Array(Math.floor(bytes / 2));
      for (let i = 0; i < out.length; i++) out[i] = wav.readInt16LE(at + 8 + i * 2) / 32768;
      return out;
    }
    at += 8 + size + (size % 2);
  }
  throw new Error("no data chunk in the WAV");
}

export function rmsBins(samples: Float32Array, rate: number, binSec = BIN_SEC): number[] {
  const n = Math.round(rate * binSec);
  const bins: number[] = [];
  for (let start = 0; start < samples.length; start += n) {
    const end = Math.min(samples.length, start + n);
    let sum = 0;
    for (let i = start; i < end; i++) sum += samples[i]! * samples[i]!;
    bins.push(Math.sqrt(sum / (end - start)));
  }
  return bins;
}

// Share of the bins covered by a word span (from/to in frames) that hold silence.
export function silentShareInWords(bins: number[], words: { from: number; to: number }[], fps: number, binSec = BIN_SEC): number {
  const covered = new Set<number>();
  for (const w of words) {
    for (let b = Math.floor(w.from / fps / binSec); b <= Math.floor(w.to / fps / binSec); b++) covered.add(b);
  }
  if (covered.size === 0) return 0;
  let silent = 0;
  for (const b of covered) if ((bins[b] ?? 0) <= SILENT_RMS) silent++;
  return silent / covered.size;
}
