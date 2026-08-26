import type { Localized } from "@/content/types";

/** A ready-made fragment body for the playground. `source` assumes the
 *  playground prelude: uTime, uResolution, uMouse, out vec4 fragColor. */
export interface PlaygroundPreset {
  slug: string;
  title: Localized<string>;
  source: string;
}

export interface PlaygroundPresetGroup {
  id: string;
  label: Localized<string>;
  presets: PlaygroundPreset[];
}
