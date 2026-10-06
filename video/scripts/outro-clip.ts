import fs from "node:fs";
import path from "node:path";
import type { Timing } from "../src/scene/timing";

export const OUTRO_SCENE = "outro";
// Outro.tsx: after {next} the buttons fade and Inko crosses to the right within 26 frames.
export const OUTRO_LEAVE_FRAMES = 26;

export type OutroClip = {
  fps: number;
  frames: number;
  cues: { like: number; sub: number; next: number };
  leaveFrames: number;
};

// The clip's metadata, from the timing of the `outro` fixture (a single scene starting at frame 0).
export function buildOutroClip(timing: Timing): OutroClip {
  const [scene] = timing.scenes;
  if (timing.scenes.length !== 1 || scene!.id !== OUTRO_SCENE || scene!.from !== 0) {
    throw new Error(`the outro fixture must be one scene "${OUTRO_SCENE}" starting at frame 0`);
  }
  const cue = (name: string) => {
    const at = timing.cues[`${OUTRO_SCENE}.${name}`];
    if (at === undefined) throw new Error(`the outro script has no {${name}} cue`);
    return at;
  };
  return {
    fps: timing.fps,
    frames: scene!.durationInFrames,
    cues: { like: cue("like"), sub: cue("sub"), next: cue("next") },
    leaveFrames: OUTRO_LEAVE_FRAMES,
  };
}

export function readOutroClip(dir: string): OutroClip {
  const clip = JSON.parse(fs.readFileSync(path.join(dir, "outro.json"), "utf8")) as OutroClip;
  const numbers = [clip.fps, clip.frames, clip.leaveFrames, clip.cues?.like, clip.cues?.sub, clip.cues?.next];
  if (!numbers.every(Number.isInteger)) throw new Error(`${dir}/outro.json is not a valid outro clip; run pnpm outro`);
  return clip;
}
