import type { LessonModule } from "../scene/LessonVideo";
import { lesson as cartesianAndUvSpace } from "./cartesian-and-uv-space";
import { lesson as dotAndCrossProducts } from "./dot-and-cross-products";
import { lesson as dummy } from "./dummy";
import { lesson as outro } from "./outro";
import { lesson as style } from "./style";
import { lesson as vectorBasics } from "./vector-basics";

// Composition id = lesson slug (Remotion ids allow only a-z, A-Z, 0-9 and "-").
// `dummy`, `outro` and `style` are pipeline fixtures, not lessons.
export const LESSONS: Record<string, LessonModule> = {
  dummy,
  outro,
  style,
  "cartesian-and-uv-space": cartesianAndUvSpace,
  "vector-basics": vectorBasics,
  "dot-and-cross-products": dotAndCrossProducts,
};
