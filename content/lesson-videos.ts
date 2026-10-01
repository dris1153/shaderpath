import type { LessonSlug } from "./slugs";
import type { Locale } from "./types";

// Lesson explainer videos (produced by the video/ pipeline). `youtube` is the
// English upload; `dubs` lists the other languages whose voice track is served
// from public/videos/<slug>/audio.<locale>.mp3 and played in sync with it.
export const LESSON_VIDEOS: Partial<Record<LessonSlug, { youtube: string; dubs?: Locale[] }>> = {
  "cartesian-and-uv-space": { youtube: "3b5tImERLhU", dubs: ["vi"] },
  "vector-basics": { youtube: "3Krj7h98Pkk", dubs: ["vi"] },
};
