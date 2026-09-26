import { describe, expect, it } from "vitest";
import { LESSONS, MODULES, TRACKS } from "@/content/curriculum";
import { trackChain, trackDependencies, trackLinks } from "@/lib/roadmap/chain";
import {
  chainEdges,
  layoutRoadmap,
  lessonEdges,
  type LayoutId,
} from "@/lib/roadmap/layouts";

const LAYOUTS: LayoutId[] = ["serpentine", "horizontal", "vertical", "columns"];

describe("track chain", () => {
  // Derived, not listed: a curriculum that grows a real branch should fail
  // here rather than render a map that claims a sequence it does not have.
  it("is a single sequence with one convergence at the end", () => {
    const deps = trackDependencies(LESSONS);
    const chain = trackChain(TRACKS);
    const many = chain.filter((t) => (deps.get(t.id)?.size ?? 0) > 1);
    expect(many.map((t) => t.id)).toEqual(["capstones"]);
    expect(deps.get("capstones")!.size).toBe(6);
  });

  it("orders math first and capstones last", () => {
    const chain = trackChain(TRACKS).map((t) => t.id);
    expect(chain[0]).toBe("math");
    expect(chain.at(-1)).toBe("capstones");
    expect(chain).toHaveLength(14);
  });

  it("links every consecutive pair plus the convergence", () => {
    const links = trackLinks(TRACKS, LESSONS);
    const chain = trackChain(TRACKS);
    for (let i = 1; i < chain.length; i++) {
      expect(
        links.some((l) => l.from === chain[i - 1]!.id && l.to === chain[i]!.id),
        `${chain[i - 1]!.id} -> ${chain[i]!.id}`,
      ).toBe(true);
    }
    expect(links.filter((l) => l.to === "capstones").length).toBeGreaterThan(1);
  });

  it("emits no duplicates and no self-links", () => {
    const links = trackLinks(TRACKS, LESSONS);
    expect(links.some((l) => l.from === l.to)).toBe(false);
    expect(new Set(links.map((l) => `${l.from}->${l.to}`)).size).toBe(
      links.length,
    );
  });

  it("points both ends of every chain edge at a real track node", () => {
    const ids = new Set(TRACKS.map((t) => `track:${t.id}`));
    for (const edge of chainEdges(TRACKS, LESSONS)) {
      expect(ids.has(edge.from), edge.id).toBe(true);
      expect(ids.has(edge.to), edge.id).toBe(true);
    }
  });
});

describe.each(LAYOUTS)("layoutRoadmap %s", (id) => {
  const layout = layoutRoadmap(TRACKS, MODULES, LESSONS, id);
  const of = (kind: string) => layout.nodes.filter((n) => n.kind === kind);

  it("places every track, module and lesson exactly once", () => {
    expect(of("track")).toHaveLength(TRACKS.length);
    expect(of("module")).toHaveLength(MODULES.length);
    expect(of("lesson")).toHaveLength(LESSONS.length);
    expect(new Set(layout.nodes.map((n) => n.id)).size).toBe(
      layout.nodes.length,
    );
  });

  it("keeps coordinates finite and never stacks two nodes on one spot", () => {
    for (const n of layout.nodes) {
      expect(Number.isFinite(n.x) && Number.isFinite(n.y), n.id).toBe(true);
    }
    const spots = layout.nodes.map((n) => `${n.x},${n.y}`);
    expect(new Set(spots).size).toBe(spots.length);
  });

  it("mirrors the curriculum: every cross-track prerequisite becomes an edge", () => {
    const trackOf = new Map(LESSONS.map((l) => [l.slug, l.trackId]));
    const expected = LESSONS.flatMap((l) =>
      l.prerequisites
        .filter((p) => trackOf.get(p) !== l.trackId)
        .map((p) => `${p}->${l.slug}`),
    );
    expect(
      lessonEdges(LESSONS)
        .map((e) => e.id)
        .sort(),
    ).toEqual(expected.sort());
    expect(layout.edges).toEqual(lessonEdges(LESSONS));
  });

  it("is deterministic", () => {
    expect(layoutRoadmap(TRACKS, MODULES, LESSONS, id)).toEqual(layout);
  });
});

describe("layout shapes", () => {
  const tracksOf = (id: LayoutId) =>
    layoutRoadmap(TRACKS, MODULES, LESSONS, id).nodes.filter(
      (n) => n.kind === "track",
    );

  it("defaults to the serpentine", () => {
    expect(layoutRoadmap(TRACKS, MODULES, LESSONS)).toEqual(
      layoutRoadmap(TRACKS, MODULES, LESSONS, "serpentine"),
    );
  });

  // Row 0 runs left to right, row 1 right to left, so the route stays
  // continuous across the fold instead of jumping back to the left edge.
  it("folds the serpentine five wide, reversing on alternate rows", () => {
    const s = tracksOf("serpentine");
    expect(s[4]!.x).toBeGreaterThan(s[0]!.x);
    expect(s[5]!.x).toBe(s[4]!.x);
    expect(s[9]!.x).toBe(s[0]!.x);
    expect(s[5]!.y).toBeGreaterThan(s[4]!.y);
  });

  it.each([
    ["horizontal", "x", "y"],
    ["vertical", "y", "x"],
  ] as const)("lays %s out on one line", (id, along, across) => {
    const s = tracksOf(id);
    expect(new Set(s.map((n) => n[across])).size).toBe(1);
    for (let i = 1; i < s.length; i++)
      expect(s[i]![along]).toBeGreaterThan(s[i - 1]![along]);
  });

  it("gives columns one column per track and the compact style", () => {
    const layout = layoutRoadmap(TRACKS, MODULES, LESSONS, "columns");
    expect(layout.style).toBe("compact");
    const x = new Map(tracksOf("columns").map((n) => [n.track!.id, n.x]));
    expect(new Set(x.values()).size).toBe(TRACKS.length);
    for (const n of layout.nodes) {
      const trackId = n.track?.id ?? n.module?.trackId ?? n.lesson!.trackId;
      expect(n.x, n.id).toBe(x.get(trackId));
    }
  });
});
