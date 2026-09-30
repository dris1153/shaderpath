import { Easing, interpolate } from "remotion";

// Fast start, long soft landing: slides and reveals. (Pop uses a spring.)
export const settle = Easing.bezier(0.22, 1, 0.36, 1);

// 0 → 1 over `duration` frames starting at t = 0, clamped both ends.
export function progress(t: number, duration: number, easing = settle): number {
  return interpolate(t, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
}
