// Frames the repo already renders by running each lesson's own solution code
// (`pnpm gen:shots:three` / `gen:shots`), referenced in place rather than
// copied: a re-render updates the landing page too, and there is no second
// copy to go stale. next/image serves them as WebP without a build step.
// Sizes are the intrinsic ones, so the grid holds its space before the bytes
// arrive.
export const SHOTS = [
  {
    slug: "checkpoint-raymarched-vista",
    src: "/figures/08-raymarching/checkpoint-raymarched-vista.png",
    width: 640,
    height: 360,
  },
  {
    slug: "checkpoint-pattern-tile-poster",
    src: "/figures/02-glsl/checkpoint-pattern-tile-poster.png",
    width: 512,
    height: 512,
  },
  {
    slug: "checkpoint-material-study",
    src: "/figures/11-pbr/checkpoint-material-study.png",
    width: 640,
    height: 400,
  },
] as const;
