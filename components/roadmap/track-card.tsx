"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pick, type Locale, type TrackDef } from "@/content/types";
import { currentTrackId, getModulesOfTrack, trackCompletion } from "@/lib/curriculum";
import { useProgressMap } from "@/lib/hooks/use-progress-map";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { ModuleAccordion } from "./module-accordion";

export function TrackCard({
  track,
  locale,
  hours,
}: {
  track: TrackDef;
  locale: Locale;
  hours: number;
}) {
  const t = useTranslations("roadmap");
  const { data } = useProgressMap();
  const stats = data ? trackCompletion(track.id, data.progress) : null;
  const recommended = data?.authenticated && currentTrackId(data.progress) === track.id;
  const modules = getModulesOfTrack(track.id);
  const title = pick(track.title, locale);

  return (
    <Card id={track.id} className={recommended ? "border-primary/50" : undefined}>
      <CardHeader className="flex items-start gap-4">
        {stats ? (
          <ProgressRing
            value={stats.percent}
            size={56}
            label={`${title}: ${t("coreProgress", { completed: stats.coreCompleted, total: stats.coreTotal })}`}
          >
            <span className="text-sm tabular-nums">{track.order + 1}</span>
          </ProgressRing>
        ) : (
          <Skeleton className="size-14 shrink-0 rounded-full" />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl leading-tight">
              <Link href={`/track/${track.id}`} className="hover:underline">
                {title}
              </Link>
            </h2>
            {recommended && <Badge variant="coral">{t("recommended")}</Badge>}
          </div>
          <p className="text-muted-foreground">{pick(track.summary, locale)}</p>
          <p className="text-muted-foreground text-sm font-semibold tabular-nums">
            {stats ? t("coreProgress", { completed: stats.coreCompleted, total: stats.coreTotal }) : "…"}
            {" · "}
            {t("mapHours", { hours })}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <ModuleAccordion modules={modules} locale={locale} />
      </CardContent>
    </Card>
  );
}
