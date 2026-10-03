import type { LessonModule } from "../../scene/LessonVideo";
import { Angle } from "./angle";
import { Cross } from "./cross";
import { Hook } from "./hook";
import { MultiplyAdd } from "./multiply-add";
import { Pending } from "./pending";

export const lesson: LessonModule = {
  scenes: {
    hook: Hook,
    "multiply-add": MultiplyAdd,
    angle: Angle,
    vision: Pending,
    projection: Pending,
    cross: Cross,
    normal: Pending,
    light: Pending,
    recap: Pending,
  },
};
