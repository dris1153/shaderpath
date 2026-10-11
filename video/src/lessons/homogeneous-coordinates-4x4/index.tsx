import type { LessonModule } from "../../scene/LessonVideo";
import { Divide } from "./divide";
import { Extra } from "./extra";
import { Hook } from "./hook";
import { Lift } from "./lift";
import { Normals } from "./normals";
import { Recap } from "./recap";
import { Switch } from "./switch";
import { Trs } from "./trs";

export const lesson: LessonModule = {
  scenes: {
    hook: Hook,
    extra: Extra,
    lift: Lift,
    switch: Switch,
    normals: Normals,
    trs: Trs,
    divide: Divide,
    recap: Recap,
  },
};
