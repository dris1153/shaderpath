import type { LessonModule } from "../../scene/LessonVideo";
import { Add } from "./add";
import { Hook } from "./hook";
import { Length } from "./length";
import { Normalize } from "./normalize";
import { Recap } from "./recap";
import { Roles } from "./roles";
import { Scale } from "./scale";
import { Subtract } from "./subtract";
import { What } from "./what";

export const lesson: LessonModule = {
  scenes: {
    hook: Hook,
    what: What,
    add: Add,
    subtract: Subtract,
    scale: Scale,
    length: Length,
    normalize: Normalize,
    roles: Roles,
    recap: Recap,
  },
};
