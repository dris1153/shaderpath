import { BASICS_PRESETS } from "./basics";
import { NOISE_PRESETS } from "./noise";
import { RAYMARCH_PRESETS } from "./raymarch";
import type { PlaygroundPresetGroup } from "./types";

export type { PlaygroundPreset, PlaygroundPresetGroup } from "./types";

// Ready-made shaders shipped with the app. They live in code, not the DB: the
// learner cannot delete them, they version with the app, and they stay out of
// the progress export. Never lift these from an exercise's solutionCode.
export const PRESET_GROUPS: PlaygroundPresetGroup[] = [
  {
    id: "basics-2d",
    label: { vi: "Cơ bản 2D", en: "2D Basics" },
    presets: BASICS_PRESETS,
  },
  {
    id: "procedural",
    label: { vi: "Noise & thủ tục", en: "Noise & Procedural" },
    presets: NOISE_PRESETS,
  },
  {
    id: "raymarching",
    label: { vi: "Raymarching 3D", en: "3D Raymarching" },
    presets: RAYMARCH_PRESETS,
  },
];

export const ALL_PRESETS = PRESET_GROUPS.flatMap((g) => g.presets);

export function findPreset(slug: string) {
  return ALL_PRESETS.find((p) => p.slug === slug);
}
