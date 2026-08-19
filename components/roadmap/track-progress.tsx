"use client";

import { useTranslations } from "next-intl";
import type { TrackId } from "@/content/types";
import { trackCompletion } from "@/lib/curriculum";
import { useProgressMap } from "@/lib/hooks/use-progress-map";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

/** The completion bar at the top of a track page. */
export function TrackProgress({
  trackId,
  title,
}: {
  trackId: TrackId;
  title: string;
}) {
  const t = useTranslations("roadmap");
  const { data } = useProgressMap();

  // Same footprint either way, so the heading below never shifts.
  if (!data) {
    return (
      <div className="mt-4 flex items-center gap-3">
        <Skeleton className="h-2 w-48" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  const stats = trackCompletion(trackId, data.progress);
  const label = t("coreProgress", {
    completed: stats.coreCompleted,
    total: stats.coreTotal,
  });

  return (
    <div className="mt-4 flex items-center gap-3">
      <Progress
        value={stats.percent}
        aria-label={`${title}: ${label}`}
        className="w-48"
      />
      <span className="text-muted-foreground text-xs tabular-nums">{label}</span>
    </div>
  );
}
