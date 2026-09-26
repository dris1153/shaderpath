import { describe, expect, it } from "vitest";
import { LESSONS, MODULES, TRACKS } from "@/content/curriculum";
import { trackChain } from "@/lib/roadmap/chain";
import {
  difficultyPips,
  hoursLabel,
  longestRegularMinutes,
  roadFraction,
  trackStats,
} from "@/lib/roadmap/encoding";
import { CARD, layoutRoadmap } from "@/lib/roadmap/layouts";

const chain = trackChain(TRACKS);
const yardstick = longestRegularMinutes(chain, LESSONS);
const stats = chain.map((t) => trackStats(t, LESSONS));

describe("road length", () => {
  // Capstones runs ~32h against 6–9h for the rest. Measuring bars against it
  // would crush thirteen tracks into a quarter of the width.
  it("measures against the longest track that is not the terminus", () => {
    expect(yardstick).toBeLessThan(stats.at(-1)!.minutes);
    expect(yardstick).toBe(
      Math.max(...stats.slice(0, -1).map((s) => s.minutes)),
    );
  });

  it("caps the terminus at full length rather than overflowing", () => {
    expect(roadFraction(stats.at(-1)!.minutes, yardstick)).toBe(1);
  });

  it("keeps every regular track comparable, the longest at full length", () => {
    const fractions = stats
      .slice(0, -1)
      .map((s) => roadFraction(s.minutes, yardstick));
    for (const f of fractions) {
      expect(f).toBeGreaterThan(0);
      expect(f).toBeLessThanOrEqual(1);
    }
    expect(Math.max(...fractions)).toBe(1);
  });

  // Pinned so a curriculum change that makes one track far longer surfaces
  // here instead of silently turning every other bar into a stub.
  it("has no regular track more than twice another", () => {
    const regular = stats.slice(0, -1).map((s) => s.minutes);
    expect(Math.max(...regular) / Math.min(...regular)).toBeLessThan(2);
  });
});

describe("difficulty", () => {
  it.each([
    [2.43, 2.5],
    [2.2, 2],
    [4.58, 4.5],
    [5, 5],
  ])("rounds %s to %s pips", (value, pips) => {
    expect(difficultyPips(value)).toBe(pips);
  });

  // The fact that makes the map worth remembering: the route climbs.
  it("rises along the chain", () => {
    const mean = (xs: typeof stats) =>
      xs.reduce((sum, s) => sum + s.difficulty, 0) / xs.length;
    expect(mean(stats.slice(0, 4))).toBeLessThan(mean(stats.slice(-5, -1)));
  });
});

describe("labels", () => {
  it.each([
    [559, "9.3"],
    [366, "6.1"],
    [1920, "32"],
  ])("shows %s minutes as %s hours", (minutes, label) => {
    expect(hoursLabel(minutes)).toBe(label);
  });
});

describe("card containment", () => {
  // Rows live inside their track's card. If a track grows past what the card
  // was sized for, its lessons spill over the next station.
  it.each(["serpentine", "horizontal", "vertical"] as const)(
    "keeps every module and lesson inside its own track card (%s)",
    (id) => {
      const { nodes } = layoutRoadmap(TRACKS, MODULES, LESSONS, id);
      const cards = new Map(
        nodes.filter((n) => n.kind === "track").map((n) => [n.track!.id, n]),
      );
      for (const n of nodes) {
        if (n.kind === "track") continue;
        const trackId = n.module?.trackId ?? n.lesson!.trackId;
        const card = cards.get(trackId)!;
        expect(n.x, `${n.id} left`).toBeGreaterThanOrEqual(card.x);
        expect(n.x + n.w, `${n.id} right`).toBeLessThanOrEqual(card.x + CARD.w);
        expect(n.y, `${n.id} top`).toBeGreaterThanOrEqual(card.y + CARD.header);
        expect(n.y + n.h, `${n.id} bottom`).toBeLessThanOrEqual(
          card.y + CARD.h,
        );
      }
    },
  );
});
