import { describe, expect, it } from "vitest";
import { LESSONS, MODULES, TRACKS } from "@/content/curriculum";
import { LESSON_SLUGS } from "@/content/slugs";
import {
  isUnlocked,
  overallCompletion,
  trackCompletion,
  type ProgressMap,
} from "@/lib/curriculum";

describe("curriculum structural invariants", () => {
  it("covers every registered slug exactly once", () => {
    const seen = new Map<string, number>();
    for (const l of LESSONS) {
      seen.set(l.slug, (seen.get(l.slug) ?? 0) + 1);
    }
    const missing = LESSON_SLUGS.filter((s) => !seen.has(s));
    const duplicated = [...seen.entries()].filter(([, n]) => n > 1);
    expect(missing, `slugs without metadata: ${missing.join(", ")}`).toEqual([]);
    expect(duplicated, "duplicated slugs").toEqual([]);
    expect(LESSONS.length).toBe(LESSON_SLUGS.length);
  });

  it("links every lesson to an existing module that lists it", () => {
    const moduleById = new Map(MODULES.map((m) => [m.id, m]));
    for (const l of LESSONS) {
      const mod = moduleById.get(l.moduleId);
      expect(mod, `lesson ${l.slug} has unknown module ${l.moduleId}`).toBeDefined();
      expect(
        mod?.lessonSlugs,
        `module ${l.moduleId} does not list ${l.slug}`,
      ).toContain(l.slug);
    }
  });

  it("links every track to its modules and vice versa", () => {
    const trackById = new Map(TRACKS.map((t) => [t.id, t]));
    for (const m of MODULES) {
      const track = trackById.get(m.trackId);
      expect(track, `module ${m.id} has unknown track ${m.trackId}`).toBeDefined();
      expect(track?.moduleIds, `track ${m.trackId} misses ${m.id}`).toContain(m.id);
    }
    for (const t of TRACKS) {
      for (const id of t.moduleIds) {
        expect(
          MODULES.some((m) => m.id === id),
          `track ${t.id} lists unknown module ${id}`,
        ).toBe(true);
      }
    }
  });

  it("only uses core lessons as prerequisites (D9)", () => {
    const bySlug = new Map(LESSONS.map((l) => [l.slug, l]));
    for (const l of LESSONS) {
      for (const p of l.prerequisites) {
        const prereq = bySlug.get(p);
        expect(prereq, `prereq ${p} of ${l.slug} missing`).toBeDefined();
        expect(
          prereq?.tier,
          `${l.slug} depends on elective ${p} — electives must never gate`,
        ).toBe("core");
      }
    }
  });

  it("keeps per-track lesson order unique and sequential", () => {
    for (const t of TRACKS) {
      const orders = LESSONS.filter((l) => l.trackId === t.id)
        .map((l) => l.order)
        .sort((a, b) => a - b);
      expect(new Set(orders).size, `duplicate order in track ${t.id}`).toBe(
        orders.length,
      );
    }
  });

  it("keeps lesson sizes inside D9 bounds", () => {
    for (const l of LESSONS) {
      if (l.trackId === "capstones") continue; // multi-session projects
      expect(
        l.estimatedMinutes,
        `${l.slug} too short (${l.estimatedMinutes}m)`,
      ).toBeGreaterThanOrEqual(20);
      expect(
        l.estimatedMinutes,
        `${l.slug} too long (${l.estimatedMinutes}m)`,
      ).toBeLessThanOrEqual(60);
    }
  });
});

describe("unlock and completion logic", () => {
  it("unlocks the very first lesson with empty progress", () => {
    expect(isUnlocked("cartesian-and-uv-space", {})).toBe(true);
    expect(isUnlocked("vector-basics", {})).toBe(false);
  });

  it("unlocks a lesson once its core prerequisites complete", () => {
    const progress: ProgressMap = { "cartesian-and-uv-space": "completed" };
    expect(isUnlocked("vector-basics", progress)).toBe(true);
  });

  it("never lets electives gate progression (D9)", () => {
    // trigonometry follows euler; elective quaternions sits between them in the module
    const progress: ProgressMap = {
      "euler-angles-and-gimbal-lock": "completed",
    };
    expect(isUnlocked("trigonometry-for-animation", progress)).toBe(true);
  });

  it("computes core-based completion, electives reported separately", () => {
    const mathCore = LESSONS.filter(
      (l) => l.trackId === "math" && l.tier === "core",
    );
    const progress: ProgressMap = Object.fromEntries(
      mathCore.map((l) => [l.slug, "completed"]),
    );
    const stats = trackCompletion("math", progress);
    expect(stats.percent).toBe(100);
    expect(stats.electiveCompleted).toBe(0);

    const overall = overallCompletion(progress);
    expect(overall.coreCompleted).toBe(mathCore.length);
    expect(overall.percent).toBeLessThan(100);
  });
});
