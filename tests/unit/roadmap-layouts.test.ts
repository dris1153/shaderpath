import { describe, expect, it } from "vitest";
import { LESSONS, MODULES, TRACKS } from "@/content/curriculum";
import { trackChain, trackDependencies, trackLinks } from "@/lib/roadmap/chain";
import { chainEdges, layoutFor, type LayoutId } from "@/lib/roadmap/layouts";

const LAYOUTS: LayoutId[] = ["columns", "horizontal", "vertical", "serpentine"];

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

describe.each(LAYOUTS)("layout %s", (id) => {
  it("places every node exactly once", () => {
    const { nodes } = layoutFor(id, TRACKS, MODULES, LESSONS);
    expect(nodes.filter((n) => n.kind === "track")).toHaveLength(TRACKS.length);
    expect(nodes.filter((n) => n.kind === "module")).toHaveLength(MODULES.length);
    expect(nodes.filter((n) => n.kind === "lesson")).toHaveLength(LESSONS.length);
    expect(new Set(nodes.map((n) => n.id)).size).toBe(nodes.length);
  });

  it("keeps coordinates finite", () => {
    for (const n of layoutFor(id, TRACKS, MODULES, LESSONS).nodes) {
      expect(Number.isFinite(n.x), `${n.id}.x`).toBe(true);
      expect(Number.isFinite(n.y), `${n.id}.y`).toBe(true);
    }
  });

  it("never puts two nodes on the same spot", () => {
    const spots = layoutFor(id, TRACKS, MODULES, LESSONS).nodes.map(
      (n) => `${n.x},${n.y}`,
    );
    expect(new Set(spots).size).toBe(spots.length);
  });

  it("never puts two stations on the same spot", () => {
    const stations = layoutFor(id, TRACKS, MODULES, LESSONS).nodes
      .filter((n) => n.kind === "track")
      .map((n) => `${n.x},${n.y}`);
    expect(new Set(stations).size).toBe(stations.length);
  });
});

describe("folds", () => {
  const stations = (id: LayoutId) =>
    layoutFor(id, TRACKS, MODULES, LESSONS).nodes.filter((n) => n.kind === "track");

  it("horizontal lays the chain out left to right", () => {
    const xs = stations("horizontal").map((n) => n.x);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
    expect(new Set(stations("horizontal").map((n) => n.y)).size).toBe(1);
  });

  it("vertical lays the chain out top to bottom", () => {
    const ys = stations("vertical").map((n) => n.y);
    expect([...ys].sort((a, b) => a - b)).toEqual(ys);
    expect(new Set(stations("vertical").map((n) => n.x)).size).toBe(1);
  });

  it("serpentine reverses direction on every other row", () => {
    const s = stations("serpentine");
    // Row 0 runs left to right, row 1 right to left, so the chain stays
    // continuous across the fold instead of jumping back to the left edge.
    expect(s[4]!.x).toBeGreaterThan(s[0]!.x);
    expect(s[5]!.x).toBe(s[4]!.x);
    expect(s[9]!.x).toBe(s[0]!.x);
    expect(s[5]!.y).toBeGreaterThan(s[4]!.y);
  });
});
