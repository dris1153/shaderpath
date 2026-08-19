import type { AttemptVM } from "@/components/exercise/types";
import type { ProgressMap } from "@/lib/curriculum";
import type { ProgressRow } from "@/lib/progress-read";

// The per-user half of a lesson page. The page itself renders from content
// files; everything here arrives after hydration through /api/lesson-state,
// which is what lets a lesson still render when the database is unreachable.
//
// Deliberately not `ProgressRow` wholesale: that row carries timestamps, which
// would arrive as strings and quietly disagree with their declared type.
export interface LessonState {
  row: Pick<ProgressRow, "status" | "confidence" | "scrollPercent"> | null;
  bookmarked: boolean;
  /** Keyed by exercise id. */
  attempts: Record<string, AttemptVM>;
  /** The whole map: the sidebar needs sibling lessons, not just this one. */
  progress: ProgressMap;
}
