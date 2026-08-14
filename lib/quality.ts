// Adaptive quality tier (spec §6.2.14 / decision A4). detect() is the only
// impure entrypoint (touches WebGL/navigator/rAF); everything it delegates
// to is a pure, unit-testable classifier.

export type QualityTier = "low" | "medium" | "high";

/** Used when no signal is available — a mid-range assumption, never a crash. */
export const DEFAULT_TIER: QualityTier = "medium";

export const TIER_CONFIG: Record<
  QualityTier,
  { dpr: [number, number]; effectBudget: number }
> = {
  low: { dpr: [1, 1], effectBudget: 0.5 },
  medium: { dpr: [1, 1.5], effectBudget: 0.75 },
  high: { dpr: [1, 2], effectBudget: 1 },
};

const RANK: Record<QualityTier, number> = { low: 0, medium: 1, high: 2 };

const LOW_END_PATTERNS = [/swiftshader/i, /software/i, /llvmpipe/i, /basic render/i];
const INTEGRATED_PATTERNS = [/intel/i, /uhd graphics/i, /iris/i];
const HIGH_END_PATTERNS = [
  /nvidia/i,
  /geforce/i,
  /rtx/i,
  /gtx/i,
  /radeon/i,
  /\bamd\b/i,
  /apple m\d/i,
  /apple gpu/i,
];

/** Heuristic over the WEBGL_debug_renderer_info string; null = no signal. */
export function classifyRenderer(renderer: string | null): QualityTier | null {
  if (!renderer) return null;
  if (LOW_END_PATTERNS.some((p) => p.test(renderer))) return "low";
  if (HIGH_END_PATTERNS.some((p) => p.test(renderer))) return "high";
  if (INTEGRATED_PATTERNS.some((p) => p.test(renderer))) return "medium";
  return null;
}

/** navigator.deviceMemory (GB) heuristic; null = no signal (unsupported browser). */
export function classifyDeviceMemory(gb: number | undefined): QualityTier | null {
  if (typeof gb !== "number" || !Number.isFinite(gb)) return null;
  if (gb < 4) return "low";
  if (gb < 8) return "medium";
  return "high";
}

/** Average ms/frame from the rAF probe, relative to the 16.6ms 60fps budget. */
export function classifyFrameTime(avgMs: number): QualityTier {
  if (avgMs <= 0) return DEFAULT_TIER;
  if (avgMs <= 18) return "high";
  if (avgMs <= 34) return "medium";
  return "low";
}

/** Worst-case across available signals; falls back to DEFAULT_TIER if all are null. */
export function combineTiers(signals: (QualityTier | null)[]): QualityTier {
  const present = signals.filter((s): s is QualityTier => s !== null);
  if (present.length === 0) return DEFAULT_TIER;
  return present.reduce((worst, s) => (RANK[s] < RANK[worst] ? s : worst));
}

/** Mean delta between consecutive rAF timestamps (ms). */
export function averageFrameDelta(timestamps: number[]): number {
  if (timestamps.length < 2) return 0;
  const deltas: number[] = [];
  for (let i = 1; i < timestamps.length; i++) {
    const prev = timestamps[i - 1];
    const cur = timestamps[i];
    if (prev !== undefined && cur !== undefined) deltas.push(cur - prev);
  }
  if (deltas.length === 0) return 0;
  return deltas.reduce((a, b) => a + b, 0) / deltas.length;
}

/** WEBGL_debug_renderer_info string via a throwaway canvas; null if unavailable. */
export function getGpuRendererString(): string | null {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return null;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return null;
    const renderer: unknown = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
    return typeof renderer === "string" ? renderer : null;
  } catch {
    return null;
  }
}

/** navigator.deviceMemory is Chromium-only and absent from lib.dom types. */
export function getDeviceMemoryGb(): number | undefined {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return nav.deviceMemory;
}

/** Samples `sampleFrames` rAF ticks and resolves the average ms/frame. */
export function probeFrameTime(sampleFrames = 15): Promise<number> {
  return new Promise((resolve) => {
    const timestamps: number[] = [];
    function tick(t: number) {
      timestamps.push(t);
      if (timestamps.length <= sampleFrames) {
        requestAnimationFrame(tick);
      } else {
        resolve(averageFrameDelta(timestamps));
      }
    }
    requestAnimationFrame(tick);
  });
}

/** Runs the full heuristic once; callers persist the result (see lib/settings.ts). */
export async function detect(): Promise<QualityTier> {
  const rendererTier = classifyRenderer(getGpuRendererString());
  const memoryTier = classifyDeviceMemory(getDeviceMemoryGb());
  const avgFrameMs = await probeFrameTime();
  const frameTier = classifyFrameTime(avgFrameMs);
  return combineTiers([rendererTier, memoryTier, frameTier]);
}
