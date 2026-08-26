import { describe, expect, it } from "vitest";
import { LESSONS, MODULES, TRACKS } from "@/content/curriculum";
import { CORE_LOCALES } from "@/content/types";
import {
  COL_W,
  layoutCurriculumMap,
} from "@/components/roadmap/curriculum-map-layout";

describe("layoutCurriculumMap", () => {
  const layout = layoutCurriculumMap(TRACKS, MODULES, LESSONS);
  const lessonNodes = layout.nodes.filter((n) => n.kind === "lesson");

  it("places every lesson exactly once", () => {
    expect(lessonNodes.length).toBe(LESSONS.length);
    expect(new Set(lessonNodes.map((n) => n.id)).size).toBe(LESSONS.length);
  });

  it("puts each track in its own column with strictly increasing rows", () => {
    const byTrack = new Map<string, number[]>();
    for (const n of lessonNodes) {
      const track = n.lesson!.trackId;
      expect(n.x % COL_W).toBe(0);
      const ys = byTrack.get(track) ?? [];
      ys.push(n.y);
      byTrack.set(track, ys);
    }
    expect(byTrack.size).toBe(TRACKS.length);
    for (const [track, ys] of byTrack) {
      const xs = new Set(
        lessonNodes.filter((n) => n.lesson!.trackId === track).map((n) => n.x),
      );
      expect(xs.size, `track ${track} spans one column`).toBe(1);
      for (let i = 1; i < ys.length; i++) {
        expect(ys[i]!, `track ${track} rows increase`).toBeGreaterThan(ys[i - 1]!);
      }
    }
  });

  it("emits only cross-track prerequisite edges, and at least one", () => {
    const trackOf = new Map(LESSONS.map((l) => [l.slug, l.trackId]));
    expect(layout.edges.length).toBeGreaterThan(0);
    for (const e of layout.edges) {
      expect(trackOf.get(e.from)).toBeDefined();
      expect(trackOf.get(e.to)).toBeDefined();
      expect(trackOf.get(e.from), `${e.id} must cross tracks`).not.toBe(
        trackOf.get(e.to),
      );
    }
  });

  it("keeps every lesson title short enough for ROW_H", () => {
    // Node boxes are w-56/text-xs: ~60 chars wraps to two lines (~60px), which
    // is all the 64px row affords. A longer title would silently overlap the
    // node below — bump ROW_H deliberately if a title ever needs more.
    for (const l of LESSONS) {
      // CORE_LOCALES, not LOCALES: pick() would fall back for a locale still
      // being translated and assert the default's length twice over.
      for (const locale of CORE_LOCALES) {
        expect(
          l.title[locale].length,
          `${l.slug} ${locale} title too long for the curriculum map row`,
        ).toBeLessThanOrEqual(60);
      }
    }
  });

  it("mirrors the curriculum: every cross-track prerequisite becomes an edge", () => {
    const trackOf = new Map(LESSONS.map((l) => [l.slug, l.trackId]));
    const expected = LESSONS.flatMap((l) =>
      l.prerequisites
        .filter((p) => trackOf.get(p) !== l.trackId)
        .map((p) => `${p}->${l.slug}`),
    );
    expect(layout.edges.map((e) => e.id).sort()).toEqual(expected.sort());
  });

  it("is deterministic", () => {
    expect(layoutCurriculumMap(TRACKS, MODULES, LESSONS)).toEqual(layout);
  });
});
