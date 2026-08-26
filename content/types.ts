import type { LessonSlug } from "./slugs";

// The one place a language is declared. i18n/routing.ts reads these, so adding
// a language never means editing two lists that agree only by coincidence.
// Kept dependency-free on purpose: the content scripts import this file, and
// they must not drag next-intl in with it.
export const CORE_LOCALES = ["vi", "en"] as const;
/**
 * Locales allowed to be incomplete while they are being filled in. Empty today.
 *
 * This split is what makes adding a language possible at all: `Localized<T>` is
 * a *complete* record, and content holds 3,416 of them, so a locale listed as
 * core demands 3,416 new values before the build is green again. A locale
 * listed here is optional from day one and falls back through `pick()`.
 */
export const EXTRA_LOCALES = [] as const;
export const LOCALES = [...CORE_LOCALES, ...EXTRA_LOCALES] as const;
export const DEFAULT_LOCALE = "vi" satisfies CoreLocale;

export type CoreLocale = (typeof CORE_LOCALES)[number];
export type ExtraLocale = (typeof EXTRA_LOCALES)[number];
export type Locale = CoreLocale | ExtraLocale;

export type Localized<T> = Record<CoreLocale, T> & Partial<Record<ExtraLocale, T>>;

/**
 * Reads a locale off any per-locale table, falling back to the default for a
 * locale still being filled in.
 *
 * Generic over the table, not over its value: inline copy tables in demos are
 * `as const`, so their vi and en branches have *different* literal types and a
 * `Localized<T>` parameter has nothing to infer T from. Constraining on the
 * core locales keeps the "both must exist" guarantee and returns exactly what
 * indexing used to.
 */
export function pick<T extends Record<CoreLocale, unknown>>(
  value: T,
  locale: Locale,
): PickResult<T> {
  // Own properties only: a locale is a closed union today, but the one cast to
  // it (`getLocale() as Locale`) is a trust boundary, and "constructor" would
  // otherwise resolve through the prototype.
  const own = Object.hasOwn(value, locale)
    ? (value as Record<string, unknown>)[locale]
    : undefined;
  return (own ?? value[DEFAULT_LOCALE]) as PickResult<T>;
}

/**
 * Every branch this can return. `Exclude<..., undefined>` strips the artifact of
 * an extra locale's key being optional — the function falls back rather than
 * returning undefined — while keeping the branch's own type, so a table that
 * grows an extra locale reports it instead of quietly typing as the core two.
 */
type PickResult<T> = Exclude<T[Locale & keyof T], undefined>;

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

// Mind map trees are per-locale: "section" node ids are heading slugs (which
// differ between vi/en MDX), "link" node ids are lesson slugs.
export interface MindMapNode {
  id: string;
  label: string;
  detail?: string;
  kind: "objective" | "section" | "pitfall" | "link";
  children?: MindMapNode[];
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
  // Code stays single-language (English comments): duplicating real GLSL/TS per
  // locale invites the two versions to drift apart.
  starterCode?: string;
  solutionCode?: string;
  /** Prose worked answer. Concept exercises used to smuggle this into
   *  solutionCode as `//` lines, which rendered as syntax-highlighted code. */
  solutionNote?: Localized<string>;
  hints: Localized<string>[];
  checklist: Localized<string>[];
  /** Localized because SVG figures ship one file per locale; a rendered
   *  screenshot simply names the same file twice. */
  referenceImage?: Localized<string>;
}
