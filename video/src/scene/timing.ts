// The one contract between the voice tools and the scenes. Written by
// scripts/tts.ts (or by hand for fixtures) to public/generated/<slug>/<locale>/.
export type Timing = {
  fps: number;
  width: number;
  height: number;
  scenes: { id: string; from: number; durationInFrames: number }[];
  words: { text: string; from: number; to: number; scene: string }[];
  // "<sceneId>.<cueName>" → absolute frame
  cues: Record<string, number>;
  // File name of the voice track next to timing.json; absent = silent render.
  audio?: string;
};

// Scene ids become cue-key prefixes ("<id>.<cue>"), so no dots.
const SCENE_ID = /^[a-z0-9-]+$/;

export function totalFrames(timing: Timing): number {
  return timing.scenes.reduce((sum, s) => sum + s.durationInFrames, 0);
}

function frameInt(value: unknown, what: string): number {
  if (!Number.isInteger(value)) throw new Error(`timing: ${what} must be an integer frame`);
  return value as number;
}

// Scenes play back to back in a <Series>, so each `from` must equal the sum of
// the durations before it; anything else means the file is corrupt.
export function validateTiming(timing: Timing): void {
  if (!Array.isArray(timing?.scenes) || !Array.isArray(timing.words)) {
    throw new Error("timing: scenes and words must be arrays");
  }
  if (typeof timing.cues !== "object" || timing.cues === null) {
    throw new Error("timing: cues must be an object");
  }
  const ids = new Set<string>();
  let expected = 0;
  for (const scene of timing.scenes) {
    if (!SCENE_ID.test(scene.id)) throw new Error(`timing: bad scene id "${scene.id}"`);
    if (ids.has(scene.id)) throw new Error(`timing: duplicate scene id "${scene.id}"`);
    ids.add(scene.id);
    const from = frameInt(scene.from, `scene "${scene.id}" from`);
    const dur = frameInt(scene.durationInFrames, `scene "${scene.id}" durationInFrames`);
    if (from !== expected) {
      throw new Error(`timing: scene "${scene.id}" starts at ${from}, expected ${expected}`);
    }
    if (dur <= 0) throw new Error(`timing: scene "${scene.id}" has no duration`);
    expected += dur;
  }
  for (const [key, value] of Object.entries(timing.cues)) {
    const at = frameInt(value, `cue "${key}"`);
    const sceneId = key.slice(0, key.indexOf("."));
    const scene = timing.scenes.find((s) => s.id === sceneId);
    if (!scene) throw new Error(`timing: cue "${key}" names an unknown scene`);
    if (at < scene.from || at >= scene.from + scene.durationInFrames) {
      throw new Error(`timing: cue "${key}" at ${at} falls outside its scene`);
    }
  }
}

// Frames since the cue fired, measured in scene-local time; negative before it.
export function cueOffset(localFrame: number, sceneFrom: number, cueAt: number): number {
  return localFrame - (cueAt - sceneFrom);
}

// A missing cue throws, so a script/scene mismatch fails the render instead of
// leaving an animation frozen at its start.
export function resolveCue(
  timing: Timing,
  scene: { id: string; from: number },
  name: string,
  localFrame: number,
): number {
  const at = timing.cues[`${scene.id}.${name}`];
  if (at === undefined) throw new Error(`missing cue ${scene.id}.${name}`);
  return cueOffset(localFrame, scene.from, at);
}
