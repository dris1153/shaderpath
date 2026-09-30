import type { LessonModule } from "../scene/LessonVideo";
import { lesson as dummy } from "./dummy";
import { lesson as style } from "./style";

// Composition id = lesson slug (Remotion ids allow only a-z, A-Z, 0-9 and "-").
// `dummy` and `style` are pipeline fixtures, not lessons.
export const LESSONS: Record<string, LessonModule> = {
  dummy,
  style,
};
