"use client";

import { useLocale, useTranslations } from "next-intl";
import { LESSONS, TRACKS } from "@/content/curriculum";
import { pick, type Locale } from "@/content/types";
import { Link } from "@/i18n/navigation";
import { trackCompletion, trackHours, type ProgressMap } from "@/lib/curriculum";
import { ProgressRing } from "@/components/ui/progress-ring";

const LESSON_COUNT = Object.fromEntries(
  TRACKS.map((track) => [track.id, LESSONS.filter((l) => l.trackId === track.id).length]),
);

/** The 14 tracks as ringed cards. Without `progress` (guests) every ring is empty. */
export function TrackGrid({ progress }: { progress?: ProgressMap }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("roadmap");
  const tHome = useTranslations("home");

  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {TRACKS.map((track, index) => {
        const stats = progress ? trackCompletion(track.id, progress) : undefined;
        return (
          <li key={track.id}>
            <Link
              href={`/track/${track.id}`}
              className="edge-card bg-card hover:border-primary/40 flex h-full items-center gap-3 rounded-xl p-3.5 transition-colors"
            >
              <ProgressRing value={stats?.percent ?? 0} size={46}>
                <span className="text-muted-foreground tabular-nums">{index + 1}</span>
              </ProgressRing>
              <span className="min-w-0 flex-1">
                <span className="block leading-tight font-extrabold">{pick(track.title, locale)}</span>
                <span className="text-muted-foreground block text-sm tabular-nums">
                  {stats
                    ? t("coreProgress", { completed: stats.coreCompleted, total: stats.coreTotal })
                    : tHome("trackLessons", { count: LESSON_COUNT[track.id] ?? 0 })}
                  {" · "}
                  {t("mapHours", { hours: trackHours(track.id) })}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
