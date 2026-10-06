import type { LessonSlug } from "./slugs";
import type { Locale } from "./types";

// Lesson explainer videos (produced by the video/ pipeline). `youtube` is the
// English upload; `dubs` lists the other languages whose voice track is served
// from public/videos/<slug>/audio.<locale>.mp3 (generated at build from the lesson's
// youtube/languages/<locale>/site.mp3) and played in sync with it.
// `outroAt` (whole seconds, printed by `pnpm youtube`) stops the embed before
// the shared like/subscribe outro.
export const LESSON_VIDEOS: Partial<Record<LessonSlug, { youtube: string; dubs?: Locale[]; outroAt?: number }>> = {
  "cartesian-and-uv-space": { youtube: "3b5tImERLhU", dubs: ["vi"] },
  "vector-basics": { youtube: "_ZF9_d9zycQ", dubs: ["vi"], outroAt: 310 },
};
