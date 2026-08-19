"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale, TrackDef } from "@/content/types";
import { getModulesOfTrack, trackCompletion } from "@/lib/curriculum";
import { useProgressMap } from "@/lib/hooks/use-progress-map";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ModuleAccordion } from "./module-accordion";

export function TrackCard({
  track,
  locale,
}: {
  track: TrackDef;
  locale: Locale;
}) {
  const t = useTranslations("roadmap");
  const { data } = useProgressMap();
  const stats = data ? trackCompletion(track.id, data.progress) : null;
  const modules = getModulesOfTrack(track.id);

  return (
    <Card id={track.id}>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline" className="tabular-nums">
              {String(track.order).padStart(2, "0")}
            </Badge>
            <Link href={`/track/${track.id}`} className="hover:underline">
              {track.title[locale]}
            </Link>
          </CardTitle>
          {stats ? (
            <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
              {t("coreProgress", {
                completed: stats.coreCompleted,
                total: stats.coreTotal,
              })}
            </span>
          ) : (
            <Skeleton className="h-4 w-16 shrink-0" />
          )}
        </div>
        <CardDescription>{track.summary[locale]}</CardDescription>
        {stats ? (
          <Progress
            value={stats.percent}
            aria-label={`${track.title[locale]}: ${t("coreProgress", {
              completed: stats.coreCompleted,
              total: stats.coreTotal,
            })}`}
          />
        ) : (
          // Same height as Progress so the card does not jump when it resolves.
          <Skeleton className="h-2 w-full" />
        )}
      </CardHeader>
      <CardContent>
        <ModuleAccordion modules={modules} locale={locale} />
      </CardContent>
    </Card>
  );
}
