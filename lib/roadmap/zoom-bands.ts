// Which level of the curriculum the map is showing. 162 lessons cannot be
// legible in one viewport at any styling, so the map shows one level at a
// time and zoom picks the level.

export type ZoomBand = "tracks" | "modules" | "lessons";
export type NodeTier = "track" | "module" | "lesson";

/** Zooming in crosses these. */
const ENTER = { modules: 0.38, lessons: 0.78 } as const;
/** Zooming out crosses these. The gap to ENTER is the hysteresis: a single
 *  threshold makes content flicker in and out while panning on the line. */
const EXIT = { modules: 0.3, lessons: 0.62 } as const;

/** First band on mount, before any hysteresis exists to carry. */
export function bandFor(zoom: number): ZoomBand {
  if (zoom >= ENTER.lessons) return "lessons";
  if (zoom >= ENTER.modules) return "modules";
  return "tracks";
}

/** The band to show now, given where we already were. */
export function nextBand(zoom: number, current: ZoomBand): ZoomBand {
  switch (current) {
    case "tracks":
      return zoom >= ENTER.lessons
        ? "lessons"
        : zoom >= ENTER.modules
          ? "modules"
          : "tracks";
    case "modules":
      if (zoom >= ENTER.lessons) return "lessons";
      return zoom < EXIT.modules ? "tracks" : "modules";
    case "lessons":
      if (zoom < EXIT.modules) return "tracks";
      return zoom < EXIT.lessons ? "modules" : "lessons";
  }
}

export function isVisible(tier: NodeTier, band: ZoomBand): boolean {
  if (band === "lessons") return true;
  if (band === "modules") return tier !== "lesson";
  return tier === "track";
}
