import { describe, expect, it } from "vitest";
import {
  bandFor,
  isVisible,
  nextBand,
  type NodeTier,
  type ZoomBand,
} from "@/lib/roadmap/zoom-bands";

/** Walk a zoom range in small steps, carrying the band the way the map does. */
function sweep(from: number, to: number, start: ZoomBand): ZoomBand[] {
  const step = from < to ? 0.01 : -0.01;
  const seen: ZoomBand[] = [];
  let band = start;
  for (let z = from; from < to ? z <= to : z >= to; z += step) {
    const next = nextBand(Number(z.toFixed(2)), band);
    if (next !== band) seen.push(next);
    band = next;
  }
  return seen;
}

describe("zoom bands", () => {
  it("starts at the level the zoom implies", () => {
    expect(bandFor(0.2)).toBe("tracks");
    expect(bandFor(0.5)).toBe("modules");
    expect(bandFor(1.2)).toBe("lessons");
  });

  it("climbs one level at a time on the way in", () => {
    expect(sweep(0.1, 1.2, "tracks")).toEqual(["modules", "lessons"]);
  });

  it("falls back one level at a time on the way out", () => {
    expect(sweep(1.2, 0.1, "lessons")).toEqual(["modules", "tracks"]);
  });

  // The reason the thresholds are paired rather than single: a shared
  // boundary makes the map flicker while panning at that exact zoom.
  it.each([
    ["modules", 0.3, 0.38, "tracks" as ZoomBand, "modules" as ZoomBand],
    ["lessons", 0.62, 0.78, "modules" as ZoomBand, "lessons" as ZoomBand],
  ])(
    "holds its band inside the %s hysteresis gap",
    (_name, exit, enter, lower, upper) => {
      const mid = (exit + enter) / 2;
      expect(nextBand(mid, lower)).toBe(lower);
      expect(nextBand(mid, upper)).toBe(upper);
    },
  );

  it("never oscillates when jittering on a boundary", () => {
    let band: ZoomBand = "modules";
    const visited = new Set<ZoomBand>();
    for (let i = 0; i < 50; i++) {
      band = nextBand(i % 2 === 0 ? 0.33 : 0.35, band);
      visited.add(band);
    }
    expect([...visited]).toEqual(["modules"]);
  });

  it("can still drop two levels at once on a hard zoom out", () => {
    expect(nextBand(0.1, "lessons")).toBe("tracks");
  });

  it.each([
    ["tracks", ["track"]],
    ["modules", ["track", "module"]],
    ["lessons", ["track", "module", "lesson"]],
  ] as [ZoomBand, NodeTier[]][])("shows the right tiers at %s", (band, shown) => {
    const tiers: NodeTier[] = ["track", "module", "lesson"];
    expect(tiers.filter((t) => isVisible(t, band))).toEqual(shown);
  });
});
