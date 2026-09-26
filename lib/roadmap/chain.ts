import type { LessonSlug } from "@/content/slugs";
import type { LessonMeta, TrackDef } from "@/content/types";

// Collapsing the cross-track prerequisites to track level shows the shape the
// map has to draw: the curriculum is a chain, not a web. Derived rather than
// written down, so a curriculum that grows a real branch breaks the test
// instead of quietly rendering a lie.

export interface TrackLink {
  from: string;
  to: string;
}

/** Every track another track depends on, via any lesson prerequisite. */
export function trackDependencies(
  lessons: readonly LessonMeta[],
): Map<string, Set<string>> {
  const trackOf = new Map<LessonSlug, string>(
    lessons.map((l) => [l.slug, l.trackId]),
  );
  const deps = new Map<string, Set<string>>();
  for (const lesson of lessons) {
    const set = deps.get(lesson.trackId) ?? new Set<string>();
    for (const prerequisite of lesson.prerequisites) {
      const from = trackOf.get(prerequisite);
      if (from && from !== lesson.trackId) set.add(from);
    }
    deps.set(lesson.trackId, set);
  }
  return deps;
}

/** Tracks in the order they are meant to be taken. */
export function trackChain(tracks: readonly TrackDef[]): TrackDef[] {
  return [...tracks].sort((a, b) => a.order - b.order);
}

/** One link per consecutive pair, plus any dependency that skips ahead —
 *  today that is only capstones, which pulls from six tracks at once. */
export function trackLinks(
  tracks: readonly TrackDef[],
  lessons: readonly LessonMeta[],
): TrackLink[] {
  const chain = trackChain(tracks);
  const deps = trackDependencies(lessons);
  const links: TrackLink[] = [];
  const seen = new Set<string>();
  const add = (from: string, to: string) => {
    const key = `${from}->${to}`;
    if (from === to || seen.has(key)) return;
    seen.add(key);
    links.push({ from, to });
  };

  for (let i = 1; i < chain.length; i++) add(chain[i - 1]!.id, chain[i]!.id);
  for (const track of chain) {
    for (const from of deps.get(track.id) ?? []) add(from, track.id);
  }
  return links;
}
