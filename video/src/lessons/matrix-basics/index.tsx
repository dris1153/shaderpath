import type { LessonModule } from "../../scene/LessonVideo";
import { Columns } from "./columns";
import { Hook } from "./hook";
import { Machine } from "./machine";
import { Multiply } from "./multiply";
import { Order } from "./order";
import { Recap } from "./recap";
import { Rotate } from "./rotate";
import { ScaleShear } from "./scale-shear";

export const lesson: LessonModule = {
  scenes: {
    hook: Hook,
    machine: Machine,
    columns: Columns,
    multiply: Multiply,
    rotate: Rotate,
    "scale-shear": ScaleShear,
    order: Order,
    recap: Recap,
  },
};
