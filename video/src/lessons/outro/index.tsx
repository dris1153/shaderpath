import type { LessonModule } from "../../scene/LessonVideo";
import { Outro } from "./Outro";

// Fixture rendered once into content/shared/outro by `pnpm outro`; lessons join that clip.
export const lesson: LessonModule = { scenes: { outro: Outro } };
