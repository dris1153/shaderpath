import type { LessonModule } from "../../scene/LessonVideo";
import { Angle } from "./angle";
import { Cross } from "./cross";
import { Hook } from "./hook";
import { Light } from "./light";
import { MultiplyAdd } from "./multiply-add";
import { Normal } from "./normal";
import { Projection } from "./projection";
import { Recap } from "./recap";
import { Vision } from "./vision";

export const lesson: LessonModule = {
  scenes: {
    hook: Hook,
    "multiply-add": MultiplyAdd,
    angle: Angle,
    vision: Vision,
    projection: Projection,
    cross: Cross,
    normal: Normal,
    light: Light,
    recap: Recap,
  },
};
