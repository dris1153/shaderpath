import type { LessonMeta, ModuleDef, TrackDef } from "./types";
import * as t00 from "./tracks/00-math";
import * as t01 from "./tracks/01-webgl";
import * as t02 from "./tracks/02-glsl";
import * as t03 from "./tracks/03-threejs";
import * as t04 from "./tracks/04-r3f";
import * as t05 from "./tracks/05-gsap";
import * as t06 from "./tracks/06-custom-shaders";
import * as t07 from "./tracks/07-procedural";
import * as t08 from "./tracks/08-raymarching";
import * as t09 from "./tracks/09-gpgpu";
import * as t10 from "./tracks/10-postprocessing";
import * as t11 from "./tracks/11-pbr";
import * as t12 from "./tracks/12-performance";
import * as t13 from "./tracks/13-capstones";

const trackFiles = [
  t00, t01, t02, t03, t04, t05, t06, t07, t08, t09, t10, t11, t12, t13,
];

export const TRACKS: readonly TrackDef[] = trackFiles
  .map((f) => f.track)
  .sort((a, b) => a.order - b.order);

export const MODULES: readonly ModuleDef[] = trackFiles.flatMap(
  (f) => f.modules,
);

export const LESSONS: readonly LessonMeta[] = trackFiles.flatMap(
  (f) => f.lessons,
);

// Structural invariants (slug coverage, module linkage, prereq tiers) are
// asserted in tests/unit/curriculum.test.ts — data is static, tests are the gate.
