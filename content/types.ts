import type { LessonSlug } from "./slugs";

export type Locale = "vi" | "en";
export type Localized<T> = Record<Locale, T>;

// D9: elective never gates unlock; checkpoint = module mini-build, no new theory
export type LessonTier = "core" | "elective";
export type LessonKind = "lesson" | "checkpoint";

export type TrackId =
  | "math"
  | "webgl"
  | "glsl"
  | "threejs"
  | "r3f"
  | "gsap"
  | "custom-shaders"
  | "procedural"
  | "raymarching"
  | "gpgpu"
  | "postprocessing"
  | "pbr"
  | "performance"
  | "capstones";

export interface LessonMeta {
  slug: LessonSlug;
  trackId: TrackId;
  moduleId: string;
  order: number;
  title: Localized<string>;
  summary: Localized<string>;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedMinutes: number;
  tags: string[];
  tier: LessonTier;
  kind: LessonKind;
  prerequisites: LessonSlug[];
  objectives: Localized<string[]>;
  hasDemo: boolean;
  hasPlayground: boolean;
}

export interface ModuleDef {
  id: string;
  trackId: TrackId;
  order: number;
  title: Localized<string>;
  lessonSlugs: LessonSlug[];
}

export interface TrackDef {
  id: TrackId;
  order: number;
  title: Localized<string>;
  summary: Localized<string>;
  moduleIds: string[];
}

export interface Citation {
  id: string;
  type: "book" | "paper" | "article" | "spec" | "video" | "repo";
  title: string;
  authors?: string[];
  year?: number;
  url?: string;
  note?: Localized<string>;
}

export interface Exercise {
  id: string;
  kind: "concept" | "code" | "shader" | "build";
  prompt: Localized<string>;
  starterCode?: string;
  solutionCode?: string;
  hints: Localized<string>[];
  checklist: Localized<string>[];
  referenceImage?: string;
}
