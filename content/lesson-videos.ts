import type { LessonSlug } from "./slugs";
import type { Locale } from "./types";

// YouTube ids of lesson explainer videos (produced by the video/ pipeline).
// One upload carries every language through YouTube's multi-language audio,
// so `en` serves all locales; a locale key overrides it for a separate upload.
export const LESSON_VIDEOS: Partial<Record<LessonSlug, { en: string } & Partial<Record<Locale, string>>>> = {};
