import type { LessonModule } from "../../scene/LessonVideo";
import { Axes } from "./axes";
import { Conventions } from "./conventions";
import { Hook } from "./hook";
import { Ndc } from "./ndc";
import { PixelToUv } from "./pixel-to-uv";
import { Recap } from "./recap";
import { Uv } from "./uv";

export const lesson: LessonModule = {
  scenes: {
    hook: Hook,
    axes: Axes,
    conventions: Conventions,
    uv: Uv,
    "pixel-to-uv": PixelToUv,
    ndc: Ndc,
    recap: Recap,
  },
};
