import type { LessonModule } from "../scene/LessonVideo";
import { lesson as dummy } from "./dummy";

// Composition id = lesson slug (Remotion ids allow only a-z, A-Z, 0-9 and "-").
export const LESSONS: Record<string, LessonModule> = {
  dummy,
};
