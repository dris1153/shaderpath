"use client";

import { useLocale, useTranslations } from "next-intl";
import { TRACKS } from "@/content/curriculum";
import type { Locale } from "@/content/types";
import { useStats } from "@/lib/hooks/use-stats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heatmap } from "./heatmap";
import { TrackDistribution } from "./track-distribution";

/**
 * Every figure on the stats page. The card labels are content and render at
 * once; only the values wait, because "0h 0m" and "no data yet" are answers
 * this page has no right to give until it has read something.
 */
export function StatsView() {
  const locale = useLocale() as Locale;
  const t = useTranslations("stats");
  const tError = useTranslations("errors");
  const { data, isError } = useStats();

  const labels = [
    t("currentStreak"),
    t("longestStreak"),
    t("totalTime"),
    t("lessonsCompleted"),
    t("exercisesCompleted"),
  ];

  const stats = data?.stats;
  const values = stats
    ? [
        t("days", { n: stats.streaks.current }),
        t("days", { n: stats.streaks.longest }),
        `${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`,
        String(stats.lessonsCompleted),
        String(stats.exercisesCompleted),
      ]
    : null;

  const distribution = stats
    ? TRACKS.map((track) => ({
        track: track.title[locale],
        minutes: Math.round(stats.minutesByTrack[track.id] ?? 0),
      })).filter((d) => d.minutes > 0)
    : [];

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {labels.map((label, i) => (
          <Card key={label}>
            <CardHeader className="pb-1">
              <CardDescription>{label}</CardDescription>
              {values ? (
                <CardTitle className="text-2xl tabular-nums">
                  {values[i]}
                </CardTitle>
              ) : (
                <Skeleton className="h-8 w-20" />
              )}
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("heatmapTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <p className="text-muted-foreground text-sm">
              {tError("description")}
            </p>
          ) : data ? (
            <Heatmap
              minutesByDay={data.stats.minutesByDay}
              now={new Date(data.now)}
            />
          ) : (
            <Skeleton className="h-[102px] w-full" />
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("distributionTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <p className="text-muted-foreground text-sm">
              {tError("description")}
            </p>
          ) : !data ? (
            <Skeleton className="h-40 w-full" />
          ) : distribution.length > 0 ? (
            <TrackDistribution data={distribution} />
          ) : (
            <p className="text-muted-foreground text-sm">{t("noData")}</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
